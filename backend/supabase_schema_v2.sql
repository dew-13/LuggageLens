-- ============================================================
-- BaggageLens Schema V2: Ensemble Matching + Metadata Filtering
-- Run this in your Supabase SQL Editor to upgrade the schema
-- ============================================================

-- 1. Add CLIP embedding column (ResNet50 stays in 'embedding')
ALTER TABLE luggage ADD COLUMN IF NOT EXISTS clip_embedding vector(512);

-- 2. Add structured metadata columns for pre-filtering
ALTER TABLE luggage ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE luggage ADD COLUMN IF NOT EXISTS bag_type text;
ALTER TABLE luggage ADD COLUMN IF NOT EXISTS brand text;

-- 3. Create index on metadata columns for fast filtering
CREATE INDEX IF NOT EXISTS idx_luggage_color ON luggage (color);
CREATE INDEX IF NOT EXISTS idx_luggage_bag_type ON luggage (bag_type);
CREATE INDEX IF NOT EXISTS idx_luggage_status ON luggage (status);

-- 4. Create ivfflat indexes on both embedding columns for faster vector search
CREATE INDEX IF NOT EXISTS idx_luggage_embedding ON luggage 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
CREATE INDEX IF NOT EXISTS idx_luggage_clip_embedding ON luggage 
  USING ivfflat (clip_embedding vector_cosine_ops) WITH (lists = 50);

-- 5. New ensemble matching function:
--    Step 1: Filter by metadata (color, type) if provided
--    Step 2: Score using BOTH ResNet50 + CLIP embeddings
--    Step 3: Return combined/averaged similarity score
CREATE OR REPLACE FUNCTION match_luggage_ensemble(
  query_embedding vector(512),          -- ResNet50 embedding
  query_clip_embedding vector(512),     -- CLIP embedding
  filter_color text DEFAULT NULL,       -- Optional color filter
  filter_bag_type text DEFAULT NULL,    -- Optional bag type filter
  filter_status text DEFAULT 'found',   -- Search among found items by default
  match_threshold float DEFAULT 0.60,   -- Lower threshold since we combine scores
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
    -- Combined similarity: weighted average of both models + metadata boost
    (
      COALESCE(
        CASE WHEN l.embedding IS NOT NULL THEN 1 - (l.embedding <=> query_embedding) ELSE NULL END,
        0
      ) * 0.4  -- ResNet50: 40% weight (texture/pattern)
      +
      COALESCE(
        CASE WHEN l.clip_embedding IS NOT NULL THEN 1 - (l.clip_embedding <=> query_clip_embedding) ELSE NULL END,
        0
      ) * 0.4  -- CLIP: 40% weight (semantic understanding)
      +
      -- Metadata boost: 20% weight
      (
        CASE WHEN filter_color IS NOT NULL AND l.color IS NOT NULL AND LOWER(l.color) = LOWER(filter_color) THEN 0.10 ELSE 0 END
        +
        CASE WHEN filter_bag_type IS NOT NULL AND l.bag_type IS NOT NULL AND LOWER(l.bag_type) = LOWER(filter_bag_type) THEN 0.10 ELSE 0 END
      )
    )::float AS similarity,
    -- Individual scores for debugging
    COALESCE(CASE WHEN l.embedding IS NOT NULL THEN 1 - (l.embedding <=> query_embedding) ELSE 0 END, 0)::float AS resnet_similarity,
    COALESCE(CASE WHEN l.clip_embedding IS NOT NULL THEN 1 - (l.clip_embedding <=> query_clip_embedding) ELSE 0 END, 0)::float AS clip_similarity,
    (
      CASE WHEN filter_color IS NOT NULL AND l.color IS NOT NULL AND LOWER(l.color) = LOWER(filter_color) THEN 0.10 ELSE 0 END
      +
      CASE WHEN filter_bag_type IS NOT NULL AND l.bag_type IS NOT NULL AND LOWER(l.bag_type) = LOWER(filter_bag_type) THEN 0.10 ELSE 0 END
    )::float AS metadata_boost
  FROM luggage l
  WHERE
    -- Status filter (search found items when reporting lost, vice versa)
    (filter_status IS NULL OR l.status = filter_status)
    -- At least one embedding must exist
    AND (l.embedding IS NOT NULL OR l.clip_embedding IS NOT NULL)
  ORDER BY
    -- Sort by combined similarity descending
    (
      COALESCE(CASE WHEN l.embedding IS NOT NULL THEN 1 - (l.embedding <=> query_embedding) ELSE 0 END, 0) * 0.4
      +
      COALESCE(CASE WHEN l.clip_embedding IS NOT NULL THEN 1 - (l.clip_embedding <=> query_clip_embedding) ELSE 0 END, 0) * 0.4
      +
      CASE WHEN filter_color IS NOT NULL AND l.color IS NOT NULL AND LOWER(l.color) = LOWER(filter_color) THEN 0.10 ELSE 0 END
      +
      CASE WHEN filter_bag_type IS NOT NULL AND l.bag_type IS NOT NULL AND LOWER(l.bag_type) = LOWER(filter_bag_type) THEN 0.10 ELSE 0 END
    ) DESC
  LIMIT match_count;
END;
$$;

-- Keep the original match_luggage function for backward compatibility
-- (already exists from v1 schema)
