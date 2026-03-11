-- AetherOps — Supabase Schema
-- Run this in your Supabase SQL editor to set up all tables.

-- Deals Pipeline
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  value numeric not null,
  confidence integer not null check (confidence between 0 and 100),
  column_name text not null default 'discovery',
  has_compliance_flag boolean default false,
  created_at timestamptz default now()
);

-- Intelligence Logs (Omni-Feed)
create table if not exists intelligence_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  summary text not null,
  created_at timestamptz default now()
);

-- Contract Vulnerabilities (Compliance Radar)
create table if not exists contract_vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  severity text not null,
  clause text not null,
  description text not null,
  contract_name text not null,
  created_at timestamptz default now()
);

-- Pending Actions (Execution Queue)
create table if not exists pending_actions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient text not null,
  subject text not null,
  status text not null default 'drafted',
  created_at timestamptz default now()
);

-- Enable real-time for all tables
alter publication supabase_realtime add table deals;
alter publication supabase_realtime add table intelligence_logs;
alter publication supabase_realtime add table contract_vulnerabilities;
alter publication supabase_realtime add table pending_actions;
