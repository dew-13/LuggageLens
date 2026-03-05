-- ============================================================
-- BaggageLens Schema V3: Claims System + Watchlist + Active Tracking
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add is_active flag to luggage table
--    When a found bag is claimed & delivered → is_active = FALSE
--    This removes it from future matching without deleting history
ALTER TABLE luggage ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- The passenger's lost luggage record
    lost_luggage_id UUID REFERENCES luggage(id) NOT NULL,
    -- The found luggage being claimed
    found_luggage_id UUID REFERENCES luggage(id) NOT NULL,
    
    -- Passenger-provided verification details
    passenger_name TEXT,
    flight_number TEXT,
    travel_date DATE,
    bag_description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    proof_of_ownership TEXT,  -- URL to uploaded receipt/tag photo
    
    -- AI match data
    similarity_score FLOAT,
    
    -- Claim status lifecycle
    status TEXT DEFAULT 'pending_verification'
        CHECK (status IN (
            'pending_verification',
            'under_review',
            'more_info_needed',
            'verified',
            'ready_for_dispatch',
            'dispatched',
            'delivered',
            'rejected'
        )),
    
    -- Staff tracking
    staff_notes TEXT,
    reviewed_by TEXT,
    dispatch_tracking TEXT,  -- Shipping tracking number
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for claims table
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);
CREATE INDEX IF NOT EXISTS idx_claims_lost_luggage ON claims (lost_luggage_id);
CREATE INDEX IF NOT EXISTS idx_claims_found_luggage ON claims (found_luggage_id);

-- 4. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS claims_updated_at ON claims;
CREATE TRIGGER claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_claims_updated_at();

-- 5. Update the ensemble matching function to ONLY search active items
CREATE OR REPLACE FUNCTION match_luggage_ensemble(
  query_embedding vector(512),
  query_clip_embedding vector(512),
  filter_color text DEFAULT NULL,
  filter_bag_type text DEFAULT NULL,
  filter_status text DEFAULT 'found',
  match_threshold float DEFAULT 0.60,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  image_url text,
  description text,
  color text,
  bag_type text,
  brand text,
  status text,
  similarity float,
  resnet_similarity float,
  clip_similarity float,
  metadata_boost float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.image_url,
    l.description,
    l.color,
    l.bag_type,
    l.brand,
    l.status,
    (
      COALESCE(
        CASE WHEN l.embedding IS NOT NULL AND query_embedding IS NOT NULL
             THEN 1 - (l.embedding <=> query_embedding) ELSE NULL END,
        0
      ) * 0.4
      +
      COALESCE(
        CASE WHEN l.clip_embedding IS NOT NULL AND query_clip_embedding IS NOT NULL
             THEN 1 - (l.clip_embedding <=> query_clip_embedding) ELSE NULL END,
        0
      ) * 0.4
      +
      (
        CASE WHEN filter_color IS NOT NULL AND l.color IS NOT NULL AND LOWER(l.color) = LOWER(filter_color) THEN 0.10 ELSE 0 END
        +
        CASE WHEN filter_bag_type IS NOT NULL AND l.bag_type IS NOT NULL AND LOWER(l.bag_type) = LOWER(filter_bag_type) THEN 0.10 ELSE 0 END
      )
    )::float AS similarity,
    COALESCE(CASE WHEN l.embedding IS NOT NULL AND query_embedding IS NOT NULL
                  THEN 1 - (l.embedding <=> query_embedding) ELSE 0 END, 0)::float AS resnet_similarity,
    COALESCE(CASE WHEN l.clip_embedding IS NOT NULL AND query_clip_embedding IS NOT NULL
                  THEN 1 - (l.clip_embedding <=> query_clip_embedding) ELSE 0 END, 0)::float AS clip_similarity,
    (
      CASE WHEN filter_color IS NOT NULL AND l.color IS NOT NULL AND LOWER(l.color) = LOWER(filter_color) THEN 0.10 ELSE 0 END
      +
      CASE WHEN filter_bag_type IS NOT NULL AND l.bag_type IS NOT NULL AND LOWER(l.bag_type) = LOWER(filter_bag_type) THEN 0.10 ELSE 0 END
    )::float AS metadata_boost
  FROM luggage l
  WHERE
    (filter_status IS NULL OR l.status = filter_status)
    AND l.is_active = TRUE  -- ← Only search active (unclaimed) luggage
    AND (l.embedding IS NOT NULL OR l.clip_embedding IS NOT NULL)
  ORDER BY
    (
      COALESCE(CASE WHEN l.embedding IS NOT NULL AND query_embedding IS NOT NULL
                    THEN 1 - (l.embedding <=> query_embedding) ELSE 0 END, 0) * 0.4
      +
      COALESCE(CASE WHEN l.clip_embedding IS NOT NULL AND query_clip_embedding IS NOT NULL
                    THEN 1 - (l.clip_embedding <=> query_clip_embedding) ELSE 0 END, 0) * 0.4
      +
      CASE WHEN filter_color IS NOT NULL AND l.color IS NOT NULL AND LOWER(l.color) = LOWER(filter_color) THEN 0.10 ELSE 0 END
      +
      CASE WHEN filter_bag_type IS NOT NULL AND l.bag_type IS NOT NULL AND LOWER(l.bag_type) = LOWER(filter_bag_type) THEN 0.10 ELSE 0 END
    ) DESC
  LIMIT match_count;
END;
$$;

-- 6. Function to check a newly added found bag against ALL active lost items (watchlist)
--    This is called when staff adds a new found bag.
--    Returns lost items that match the new found bag.
CREATE OR REPLACE FUNCTION check_watchlist_matches(
  new_found_id uuid,
  match_threshold float DEFAULT 0.60,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  lost_id uuid,
  lost_image_url text,
  lost_description text,
  lost_user_id text,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  found_embedding vector(512);
  found_clip_embedding vector(512);
BEGIN
  -- Get the new found bag's embeddings
  SELECT l.embedding, l.clip_embedding
  INTO found_embedding, found_clip_embedding
  FROM luggage l
  WHERE l.id = new_found_id;

  -- Search all active LOST items for matches
  RETURN QUERY
  SELECT
    l.id AS lost_id,
    l.image_url AS lost_image_url,
    l.description AS lost_description,
    l.mongo_user_id AS lost_user_id,
    (
      COALESCE(
        CASE WHEN l.embedding IS NOT NULL AND found_embedding IS NOT NULL
             THEN 1 - (l.embedding <=> found_embedding) ELSE 0 END, 0
      ) * 0.5
      +
      COALESCE(
        CASE WHEN l.clip_embedding IS NOT NULL AND found_clip_embedding IS NOT NULL
             THEN 1 - (l.clip_embedding <=> found_clip_embedding) ELSE 0 END, 0
      ) * 0.5
    )::float AS similarity
  FROM luggage l
  WHERE
    l.status = 'lost'
    AND l.is_active = TRUE
    AND (l.embedding IS NOT NULL OR l.clip_embedding IS NOT NULL)
    AND (
      COALESCE(
        CASE WHEN l.embedding IS NOT NULL AND found_embedding IS NOT NULL
             THEN 1 - (l.embedding <=> found_embedding) ELSE 0 END, 0
      ) * 0.5
      +
      COALESCE(
        CASE WHEN l.clip_embedding IS NOT NULL AND found_clip_embedding IS NOT NULL
             THEN 1 - (l.clip_embedding <=> found_clip_embedding) ELSE 0 END, 0
      ) * 0.5
    ) >= match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
