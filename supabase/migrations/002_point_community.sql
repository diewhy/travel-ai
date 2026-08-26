-- Открой Россию — фото, отзывы, рейтинг и награды за точки маршрутов.
-- ШАГ 25. Выполнить ОДИН РАЗ в Supabase -> SQL Editor.
-- Перед запуском должен уже существовать public.profiles из шага авторизации.

begin;

-- -------------------------------------------------------------------------
-- 1. Официальный каталог точек.
-- Награды можно получить только за точку из этого каталога.
-- -------------------------------------------------------------------------
create table if not exists public.point_catalog (
  point_key text primary key,
  point_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.point_catalog
  enable row level security;

drop policy if exists
  "Anyone can read point catalog"
  on public.point_catalog;

create policy
  "Anyone can read point catalog"
  on public.point_catalog
  for select
  to anon, authenticated
  using (is_active = true);

grant select
  on table public.point_catalog
  to anon, authenticated;

insert into public.point_catalog (
  point_key,
  point_name
)
values
  ('памятник-юрию-долгорукому', 'Памятник Юрию Долгорукому'),
  ('воскресенские-ворота', 'Воскресенские ворота'),
  ('красная-площадь', 'Красная площадь'),
  ('спасская-башня-московского-кремля', 'Спасская башня Московского Кремля'),
  ('соборная-площадь-московского-кремля', 'Соборная площадь Московского Кремля'),
  ('успенскии-собор-московского-кремля', 'Успенский собор Московского Кремля'),
  ('архангельскии-собор-московского-кремля', 'Архангельский собор Московского Кремля'),
  ('палаты-бояр-романовых', 'Палаты бояр Романовых'),
  ('знаменскии-монастырь-на-варварке', 'Знаменский монастырь на Варварке'),
  ('старыи-англии-скии-двор', 'Старый Английский двор'),
  ('храм-троицы-в-никитниках', 'Храм Троицы в Никитниках'),
  ('казанскии-собор-на-краснои-площади', 'Казанский собор на Красной площади'),
  ('теремнои-дворец-московского-кремля', 'Теремной дворец Московского Кремля'),
  ('церковь-николая-чудотворца-в-хамовниках', 'Церковь Николая Чудотворца в Хамовниках'),
  ('коломенское', 'Коломенское'),
  ('преображенская-площадь', 'Преображенская площадь'),
  ('памятник-первому-гвардеи-цу-преображенского-полка', 'Памятник первому гвардейцу Преображенского полка'),
  ('лефортовскии-парк', 'Лефортовский парк'),
  ('лефортовскии-дворец', 'Лефортовский дворец'),
  ('храм-петра-и-павла-в-лефортове', 'Храм Петра и Павла в Лефортове'),
  ('немецкая-слобода-бауманская-улица', 'Немецкая слобода, Бауманская улица'),
  ('измаи-ловскии-остров', 'Измайловский остров'),
  ('мостовая-башня-измаи-ловского-острова', 'Мостовая башня Измайловского острова'),
  ('музеи-панорама-бородинская-битва', 'Музей-панорама Бородинская битва'),
  ('кутузовская-изба', 'Кутузовская изба'),
  ('триумфальные-ворота', 'Триумфальные ворота'),
  ('поклонная-гора', 'Поклонная гора'),
  ('храм-христа-спасителя', 'Храм Христа Спасителя'),
  ('манеж', 'Манеж'),
  ('музеи-отечественнои-вои-ны-1812-года', 'Музей Отечественной войны 1812 года'),
  ('большои-театр', 'Большой театр'),
  ('малыи-театр', 'Малый театр'),
  ('дом-пашкова', 'Дом Пашкова'),
  ('государственныи-историческии-музеи', 'Государственный исторический музей'),
  ('гум', 'ГУМ'),
  ('политехническии-музеи', 'Политехнический музей'),
  ('мемориально-историческии-музеи-пресня', 'Мемориально-исторический музей Пресня'),
  ('памятник-героям-революции-1905-года', 'Памятник героям революции 1905 года'),
  ('улица-красная-пресня', 'Улица Красная Пресня'),
  ('государственныи-центральныи-музеи-современнои-истории-россии', 'Государственный центральный музей современной истории России'),
  ('тверская-площадь', 'Тверская площадь'),
  ('мэрия-москвы-тверская-улица', 'Мэрия Москвы, Тверская улица'),
  ('площадь-революции', 'Площадь Революции'),
  ('дом-мельникова', 'Дом Мельникова'),
  ('дом-наркомфина', 'Дом Наркомфина'),
  ('здание-центросоюза', 'Здание Центросоюза'),
  ('клуб-имени-русакова', 'Клуб имени Русакова'),
  ('шуховская-башня', 'Шуховская башня'),
  ('дом-коммуна-на-улице-орджоникидзе', 'Дом-коммуна на улице Орджоникидзе'),
  ('дк-зил', 'ДК ЗИЛ'),
  ('гараж-госплана-на-авиамоторнои-улице', 'Гараж Госплана на Авиамоторной улице'),
  ('станция-метро-маяковская', 'Станция метро Маяковская'),
  ('станция-метро-площадь-революции', 'Станция метро Площадь Революции'),
  ('станция-метро-комсомольская', 'Станция метро Комсомольская'),
  ('главныи-павильон-вднх', 'Главный павильон ВДНХ'),
  ('фонтан-дружба-народов', 'Фонтан Дружба народов'),
  ('главное-здание-мгу', 'Главное здание МГУ'),
  ('жилои-дом-на-котельническои-набережнои', 'Жилой дом на Котельнической набережной'),
  ('гостиница-украина', 'Гостиница Украина'),
  ('александровскии-сад', 'Александровский сад'),
  ('могила-неизвестного-солдата', 'Могила Неизвестного Солдата'),
  ('памятник-маршалу-георгию-жукову', 'Памятник маршалу Георгию Жукову'),
  ('центральныи-музеи-вооруже-нных-сил', 'Центральный музей Вооружённых Сил'),
  ('государственныи-музеи-обороны-москвы', 'Государственный музей обороны Москвы'),
  ('парк-победы-на-поклоннои-горе', 'Парк Победы на Поклонной горе'),
  ('музеи-победы', 'Музей Победы'),
  ('монумент-покорителям-космоса', 'Монумент Покорителям космоса'),
  ('музеи-космонавтики', 'Музей космонавтики'),
  ('аллея-космонавтов', 'Аллея Космонавтов'),
  ('павильон-космос-на-вднх', 'Павильон Космос на ВДНХ'),
  ('мемориальныи-дом-музеи-академика-короле-ва', 'Мемориальный дом-музей академика Королёва'),
  ('московскии-планетарии', 'Московский планетарий'),
  ('памятник-юрию-гагарину-на-ленинском-проспекте', 'Памятник Юрию Гагарину на Ленинском проспекте'),
  ('останкинская-телебашня', 'Останкинская телебашня'),
  ('ново-никольскии-собор-можаи-ск', 'Ново-Никольский собор, Можайск'),
  ('бородинское-поле', 'Бородинское поле'),
  ('спасо-бородинскии-монастырь', 'Спасо-Бородинский монастырь'),
  ('волоколамскии-кремль', 'Волоколамский кремль'),
  ('мемориал-героям-панфиловцам-в-дубосеково', 'Мемориал Героям-панфиловцам в Дубосеково'),
  ('музеи-героев-панфиловцев-в-нелидово', 'Музей героев-панфиловцев в Нелидово'),
  ('новоиерусалимскии-монастырь', 'Новоиерусалимский монастырь')
on conflict (point_key)
do update set
  point_name = excluded.point_name,
  is_active = true;

-- -------------------------------------------------------------------------
-- 2. Отзывы: один пользователь = один отзыв на одну точку.
-- Редактирование разрешено, повторной награды за него нет.
-- -------------------------------------------------------------------------
create table if not exists public.point_reviews (
  id uuid primary key default gen_random_uuid(),

  point_key text not null
    references public.point_catalog(point_key),

  point_name text not null default '',

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  display_name text not null default 'Путешественник',
  avatar_url text,

  rating smallint not null
    check (rating between 1 and 5),

  review_text text not null
    check (
      char_length(review_text) between 10 and 1500
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint point_reviews_user_point_unique
    unique (user_id, point_key)
);

create index if not exists
  point_reviews_point_key_created_idx
  on public.point_reviews (
    point_key,
    created_at desc
  );

alter table public.point_reviews
  enable row level security;

drop policy if exists
  "Anyone can read point reviews"
  on public.point_reviews;
create policy
  "Anyone can read point reviews"
  on public.point_reviews
  for select
  to anon, authenticated
  using (true);

drop policy if exists
  "Users can create own point reviews"
  on public.point_reviews;
create policy
  "Users can create own point reviews"
  on public.point_reviews
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
  );

drop policy if exists
  "Users can update own point reviews"
  on public.point_reviews;
create policy
  "Users can update own point reviews"
  on public.point_reviews
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
  )
  with check (
    (select auth.uid()) = user_id
  );

grant select
  on table public.point_reviews
  to anon, authenticated;

grant insert, update
  on table public.point_reviews
  to authenticated;

-- -------------------------------------------------------------------------
-- 3. Фото: один пользователь = одна награждаемая фотография на точку.
-- Строки не удаляются клиентом, поэтому удалить и получить +50 повторно нельзя.
-- -------------------------------------------------------------------------
create table if not exists public.point_photos (
  id uuid primary key default gen_random_uuid(),

  point_key text not null
    references public.point_catalog(point_key),

  point_name text not null default '',

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  storage_path text not null unique,
  display_name text not null default 'Путешественник',
  avatar_url text,
  created_at timestamptz not null default now(),

  constraint point_photos_user_point_unique
    unique (user_id, point_key)
);

create index if not exists
  point_photos_point_key_created_idx
  on public.point_photos (
    point_key,
    created_at desc
  );

alter table public.point_photos
  enable row level security;

drop policy if exists
  "Anyone can read point photos"
  on public.point_photos;
create policy
  "Anyone can read point photos"
  on public.point_photos
  for select
  to anon, authenticated
  using (true);

drop policy if exists
  "Users can create own point photos"
  on public.point_photos;
create policy
  "Users can create own point photos"
  on public.point_photos
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
  );

grant select
  on table public.point_photos
  to anon, authenticated;

grant insert
  on table public.point_photos
  to authenticated;

-- -------------------------------------------------------------------------
-- 4. Серверная нормализация автора и названия точки.
-- Пользователь не может подменить имя/аватар/название точки запросом из браузера.
-- -------------------------------------------------------------------------
create or replace function public.prepare_point_community_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  catalog_name text;
  profile_name text;
  profile_avatar text;
begin
  select pc.point_name
    into catalog_name
  from public.point_catalog as pc
  where pc.point_key = new.point_key
    and pc.is_active = true;

  if catalog_name is null then
    raise exception 'Point is not available for community rewards';
  end if;

  select
    p.display_name,
    p.avatar_url
  into
    profile_name,
    profile_avatar
  from public.profiles as p
  where p.id = new.user_id;

  new.point_name = catalog_name;
  new.display_name = coalesce(
    nullif(profile_name, ''),
    'Путешественник'
  );
  new.avatar_url = profile_avatar;

  return new;
end;
$$;

revoke all
  on function public.prepare_point_community_row()
  from public;

-- Reviews: prepare on INSERT and UPDATE.
drop trigger if exists
  prepare_point_review
  on public.point_reviews;

create trigger prepare_point_review
before insert or update
on public.point_reviews
for each row
execute function public.prepare_point_community_row();

-- Photos: prepare only on INSERT.
drop trigger if exists
  prepare_point_photo
  on public.point_photos;

create trigger prepare_point_photo
before insert
on public.point_photos
for each row
execute function public.prepare_point_community_row();

-- Дополнительная проверка: запись point_photos не может появиться,
-- если файла реально нет в Storage bucket или путь не принадлежит пользователю.
create or replace function public.validate_point_photo_storage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  object_exists boolean;
begin
  if split_part(new.storage_path, '/', 1) <> new.user_id::text then
    raise exception 'Photo storage path does not belong to user';
  end if;

  select exists (
    select 1
    from storage.objects as o
    where o.bucket_id = 'point-photos'
      and o.name = new.storage_path
  )
  into object_exists;

  if not object_exists then
    raise exception 'Photo object not found in Storage';
  end if;

  return new;
end;
$$;

revoke all
  on function public.validate_point_photo_storage()
  from public;

drop trigger if exists
  validate_point_photo_storage_before_insert
  on public.point_photos;

create trigger validate_point_photo_storage_before_insert
before insert
on public.point_photos
for each row
execute function public.validate_point_photo_storage();

-- -------------------------------------------------------------------------
-- 5. updated_at для отзывов.
-- -------------------------------------------------------------------------
create or replace function public.set_point_review_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all
  on function public.set_point_review_updated_at()
  from public;

drop trigger if exists
  set_point_reviews_updated_at
  on public.point_reviews;

create trigger set_point_reviews_updated_at
before update
on public.point_reviews
for each row
execute function public.set_point_review_updated_at();

-- -------------------------------------------------------------------------
-- 6. Награды начисляются ТОЛЬКО БД, а не JavaScript в браузере.
-- Первое фото: +50, первое создание отзыва: +15.
-- -------------------------------------------------------------------------
create or replace function public.award_point_photo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    points = points + 50,
    photos_uploaded = photos_uploaded + 1,
    level = greatest(
      level,
      floor((points + 50)::numeric / 600)::integer + 1
    ),
    updated_at = now()
  where id = new.user_id;

  return new;
end;
$$;

revoke all
  on function public.award_point_photo()
  from public;

drop trigger if exists
  award_point_photo_after_insert
  on public.point_photos;

create trigger award_point_photo_after_insert
after insert
on public.point_photos
for each row
execute function public.award_point_photo();

create or replace function public.award_point_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    points = points + 15,
    reviews_left = reviews_left + 1,
    level = greatest(
      level,
      floor((points + 15)::numeric / 600)::integer + 1
    ),
    updated_at = now()
  where id = new.user_id;

  return new;
end;
$$;

revoke all
  on function public.award_point_review()
  from public;

drop trigger if exists
  award_point_review_after_insert
  on public.point_reviews;

create trigger award_point_review_after_insert
after insert
on public.point_reviews
for each row
execute function public.award_point_review();

-- -------------------------------------------------------------------------
-- 7. Storage bucket point-photos.
-- -------------------------------------------------------------------------
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'point-photos',
  'point-photos',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]::text[]
)
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Любой пользователь может смотреть опубликованные фото.
drop policy if exists
  "Anyone can view point photo objects"
  on storage.objects;

create policy
  "Anyone can view point photo objects"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'point-photos'
  );

-- Загружать можно только в собственную папку <user_id>/...
drop policy if exists
  "Users can upload own point photo objects"
  on storage.objects;

create policy
  "Users can upload own point photo objects"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'point-photos'
    and
    (storage.foldername(name))[1] =
      (select auth.uid()::text)
  );

-- Нужна только для очистки файла, если запись БД не создалась.
-- Удаление строки point_photos пользователю всё равно НЕ разрешено,
-- поэтому повторно получить баллы таким способом нельзя.
drop policy if exists
  "Users can delete own point photo objects"
  on storage.objects;

create policy
  "Users can delete own point photo objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'point-photos'
    and
    (storage.foldername(name))[1] =
      (select auth.uid()::text)
  );

commit;
