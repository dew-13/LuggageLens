-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table for Luggage Cases (Hybrid: links to MongoDB User ID)
create table luggage (
  id uuid default gen_random_uuid() primary key,
  mongo_user_id text not null, -- Reference to your MongoDB User._id
  image_url text not null,     -- URL from Supabase Storage
  embedding vector(512),       -- CLIP embedding (512 dimensions for ViT-B/32)
  status text not null check (status in ('lost', 'found')),
  description text,
  metadata jsonb,              -- Extra details (color, type, brands)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a similarity search function
create or replace function match_luggage(
  query_embedding vector(512),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  image_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    luggage.id,
    luggage.image_url,
    1 - (luggage.embedding <=> query_embedding) as similarity
  from luggage
  where 1 - (luggage.embedding <=> query_embedding) > match_threshold
  order by luggage.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create matches table to store detected matches
create table matches (
  id uuid default gen_random_uuid() primary key,
  lost_luggage_id uuid references luggage(id),
  found_luggage_id uuid references luggage(id),
  similarity_score float not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Access Policies (RLS) - Optional for now, but good practice
alter table luggage enable row level security;
alter table matches enable row level security;

-- Allow read/write for now (we will secure this with service keys later)
create policy "Public Access" on luggage for all using (true);
create policy "Public Access" on matches for all using (true);
