begin;

update list_items
set pos = pos + 1
where pos >= $3;

insert into list_items (list_id, description, position, last_user_id) 
values ($1, $2, $3, $4) returning *;

select nextval('list_items_position_seq');

commit;