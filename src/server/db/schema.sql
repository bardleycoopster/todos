create table users (
  id serial primary key,
  username varchar(20) not null unique,
  email varchar(100) not null unique,
  password varchar(145) not null,
  last_login_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table lists (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  name varchar(100) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table list_items (
  id serial primary key,
  list_id integer not null references lists(id) on delete cascade,
  description varchar(255) not null,
  complete boolean not null default false,
  position serial not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_user_id integer references users(id),
  -- constraints
  unique(position) deferrable initially deferred
);
create table shared_lists (
  id serial primary key,
  owner_id integer not null references users(id) on delete cascade,
  guest_id integer not null references users(id) on delete cascade,
  enabled boolean not null default true,
  position serial not null,
  unique(position) deferrable initially deferred,
  unique(owner_id, guest_id)
);