-- Stage 12: synthetic, opt-in demo data. DO NOT run on production.
-- Before running in the SAME pgAdmin session, set two session values:
--   SELECT set_config('dormhub.demo_password_hash', '<temporary BCrypt hash>', false);
--   SELECT set_config('dormhub.demo_manager_email', '<existing ACTIVE manager email>', false);
-- The hash and manager email are deliberately not stored in this file.
-- All statements run in one transaction; a failed preflight rolls them back.

BEGIN;

DO $demo$
DECLARE
  demo_hash text := nullif(current_setting('dormhub.demo_password_hash', true), '');
  manager_email text := nullif(current_setting('dormhub.demo_manager_email', true), '');
  manager_id bigint;
  resident_id bigint;
  resident_student_id bigint;
  pending_student_id bigint;
  rejected_student_id bigint;
  male_building_id bigint;
  female_building_id bigint;
  available_room_id bigint;
  resident_room_id bigint;
  female_room_id bigint;
  resident_application_id bigint;
  resident_contract_id bigint;
  room_fee_invoice_id bigint;
  utility_invoice_id bigint;
  item text;
BEGIN
  IF demo_hash IS NULL OR length(demo_hash) <> 60
     OR left(demo_hash, 4) NOT IN ('$2a$', '$2b$', '$2y$') THEN
    RAISE EXCEPTION 'Set dormhub.demo_password_hash to a temporary BCrypt hash in this pgAdmin session';
  END IF;
  IF manager_email IS NULL THEN
    RAISE EXCEPTION 'Set dormhub.demo_manager_email to an existing ACTIVE MANAGER email';
  END IF;
  SELECT id INTO manager_id FROM users
   WHERE email = manager_email AND role = 'MANAGER' AND status = 'ACTIVE';
  IF manager_id IS NULL THEN
    RAISE EXCEPTION 'The configured ACTIVE MANAGER was not found';
  END IF;

  -- JPA uses ddl-auto:update; verify columns before any insertion. This is
  -- intentionally conservative and does not claim to validate all DB constraints.
  FOREACH item IN ARRAY ARRAY[
    'users.id','users.username','users.email','users.password_hash','users.full_name','users.role','users.status','users.created_at','users.updated_at',
    'students.id','students.user_id','students.student_code','students.date_of_birth','students.gender','students.address','students.created_at','students.updated_at',
    'buildings.id','buildings.building_code','buildings.name','buildings.total_floors','buildings.gender_restriction','buildings.created_at','buildings.updated_at',
    'rooms.id','rooms.building_id','rooms.room_number','rooms.floor','rooms.room_type','rooms.capacity','rooms.current_occupancy','rooms.price_per_month','rooms.status','rooms.created_at','rooms.updated_at',
    'dorm_applications.id','dorm_applications.student_id','dorm_applications.requested_room_id','dorm_applications.request_date','dorm_applications.status','dorm_applications.note','dorm_applications.created_at','dorm_applications.updated_at',
    'contracts.contract_id','contracts.dorm_application_id','contracts.room_id','contracts.student_id','contracts.start_date','contracts.end_date','contracts.monthly_rent','contracts.deposit_amount','contracts.deposit_status','contracts.status','contracts.created_at','contracts.updated_at',
    'room_assignments.assignment_id','room_assignments.student_id','room_assignments.contract_id','room_assignments.room_id','room_assignments.assigned_by','room_assignments.assigned_at','room_assignments.check_in_at','room_assignments.status',
    'maintenance_requests.id','maintenance_requests.student_id','maintenance_requests.room_id','maintenance_requests.title','maintenance_requests.description','maintenance_requests.maintenance_status','maintenance_requests.priority','maintenance_requests.type','maintenance_requests.created_at','maintenance_requests.updated_at',
    'notifications.id','notifications.type','notifications.title','notifications.body','notifications.created_at',
    'notification_receivers.id','notification_receivers.notification_id','notification_receivers.user_id','notification_receivers.is_read',
    'meter_readings.reading_id','meter_readings.room_id','meter_readings.reading_month','meter_readings.electricity_old','meter_readings.electricity_new','meter_readings.water_old','meter_readings.water_new','meter_readings.electricity_price','meter_readings.water_price','meter_readings.status','meter_readings.created_at',
    'invoices.invoice_id','invoices.invoice_type','invoices.room_id','invoices.contract_id','invoices.billing_month','invoices.issue_date','invoices.due_date','invoices.status','invoices.total_amount',
    'invoice_details.detail_id','invoice_details.invoice_id','invoice_details.item_type','invoice_details.description','invoice_details.quantity','invoice_details.unit_price','invoice_details.amount'
  ] LOOP
    IF to_regclass(split_part(item, '.', 1)) IS NULL OR NOT EXISTS (
      SELECT 1 FROM pg_attribute
       WHERE attrelid = to_regclass(split_part(item, '.', 1))
         AND attname = split_part(item, '.', 2)
         AND attnum > 0 AND NOT attisdropped
    ) THEN
      RAISE EXCEPTION 'Demo seed requires table/column %; compare live schema with JPA entities', item;
    END IF;
  END LOOP;

  -- Synthetic accounts. Re-runs never overwrite a password or changed status.
  INSERT INTO users (username,email,password_hash,full_name,role,status,created_at,updated_at)
  SELECT v.username, v.email, demo_hash, v.full_name, 'STUDENT', v.status, now(), now()
  FROM (VALUES
    ('demo12-new','demo12-new@example.invalid','Demo Student New','ACTIVE'),
    ('demo12-pending','demo12-pending@example.invalid','Demo Student Pending','ACTIVE'),
    ('demo12-rejected','demo12-rejected@example.invalid','Demo Student Rejected','ACTIVE'),
    ('demo12-resident','demo12-resident@example.invalid','Demo Student Resident','ACTIVE'),
    ('demo12-locked','demo12-locked@example.invalid','Demo Student Locked','LOCKED'),
    ('demo12-incomplete','demo12-incomplete@example.invalid','Demo Student Incomplete','ACTIVE'),
    ('demo12-female','demo12-female@example.invalid','Demo Student Female','ACTIVE')
  ) AS v(username,email,full_name,status)
  ON CONFLICT (username) DO NOTHING;

  IF EXISTS (
    SELECT 1 FROM users WHERE username LIKE 'demo12-%'
      AND (email <> username || '@example.invalid' OR role <> 'STUDENT')
  ) THEN
    RAISE EXCEPTION 'A demo12 username exists with unexpected email or role';
  END IF;

  INSERT INTO students (user_id,student_code,date_of_birth,gender,address,created_at,updated_at)
  SELECT u.id, v.student_code, v.dob::date, v.gender, v.address, now(), now()
  FROM (VALUES
    ('demo12-new','D120001','2004-01-01','MALE','Synthetic address 01'),
    ('demo12-pending','D120002','2004-02-02','MALE','Synthetic address 02'),
    ('demo12-rejected','D120003','2004-03-03','MALE','Synthetic address 03'),
    ('demo12-resident','D120004','2004-04-04','MALE','Synthetic address 04'),
    ('demo12-locked','D120005','2004-05-05','MALE','Synthetic address 05'),
    ('demo12-incomplete','D120006',NULL,'MALE',NULL),
    ('demo12-female','D120007','2004-07-07','FEMALE','Synthetic address 07')
  ) AS v(username,student_code,dob,gender,address)
  JOIN users u ON u.username = v.username
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO buildings (building_code,name,total_floors,gender_restriction,description,created_at,updated_at)
  VALUES ('DEMO12-M','Demo 12 Male Building',3,'MALE','Synthetic demo building',now(),now()),
         ('DEMO12-F','Demo 12 Female Building',3,'FEMALE','Synthetic demo building',now(),now())
  ON CONFLICT (building_code) DO NOTHING;
  SELECT id INTO male_building_id FROM buildings WHERE building_code = 'DEMO12-M';
  SELECT id INTO female_building_id FROM buildings WHERE building_code = 'DEMO12-F';
  IF male_building_id IS NULL OR female_building_id IS NULL THEN
    RAISE EXCEPTION 'Demo buildings could not be resolved';
  END IF;
  IF EXISTS (SELECT 1 FROM buildings WHERE id=male_building_id AND gender_restriction <> 'MALE')
     OR EXISTS (SELECT 1 FROM buildings WHERE id=female_building_id AND gender_restriction <> 'FEMALE') THEN
    RAISE EXCEPTION 'A DEMO12 building has an unexpected gender restriction';
  END IF;

  INSERT INTO rooms (building_id,room_number,floor,room_type,capacity,current_occupancy,price_per_month,status,description,created_at,updated_at)
  VALUES (male_building_id,'D12-M101',1,'QUAD',4,0,600000,'AVAILABLE','Demo application room',now(),now()),
         (male_building_id,'D12-M102',1,'DOUBLE',2,1,750000,'AVAILABLE','Demo resident room',now(),now()),
         (female_building_id,'D12-F101',1,'QUAD',4,0,600000,'AVAILABLE','Demo female room',now(),now())
  ON CONFLICT (building_id,room_number) DO NOTHING;
  SELECT id INTO available_room_id FROM rooms WHERE building_id = male_building_id AND room_number = 'D12-M101';
  SELECT id INTO resident_room_id FROM rooms WHERE building_id = male_building_id AND room_number = 'D12-M102';
  SELECT id INTO female_room_id FROM rooms WHERE building_id = female_building_id AND room_number = 'D12-F101';
  IF available_room_id IS NULL OR resident_room_id IS NULL OR female_room_id IS NULL THEN
    RAISE EXCEPTION 'Demo rooms could not be resolved';
  END IF;

  SELECT u.id, s.id INTO resident_id, resident_student_id
    FROM users u JOIN students s ON s.user_id = u.id WHERE u.username = 'demo12-resident';
  SELECT s.id INTO pending_student_id FROM students s JOIN users u ON u.id = s.user_id WHERE u.username = 'demo12-pending';
  SELECT s.id INTO rejected_student_id FROM students s JOIN users u ON u.id = s.user_id WHERE u.username = 'demo12-rejected';

  INSERT INTO dorm_applications (student_id,requested_room_id,request_date,status,note,created_at,updated_at)
  SELECT v.student_id,v.room_id,now(),v.status,v.note,now(),now()
  FROM (VALUES
    (pending_student_id,available_room_id,'PENDING','DEMO12 pending application'),
    (rejected_student_id,available_room_id,'REJECTED','DEMO12 rejected application'),
    (resident_student_id,resident_room_id,'APPROVED','DEMO12 resident application')
  ) AS v(student_id,room_id,status,note)
  WHERE NOT EXISTS (SELECT 1 FROM dorm_applications d WHERE d.student_id=v.student_id AND d.note=v.note);
  SELECT id INTO resident_application_id FROM dorm_applications
   WHERE student_id=resident_student_id AND note='DEMO12 resident application';

  INSERT INTO contracts (dorm_application_id,room_id,student_id,start_date,end_date,monthly_rent,deposit_amount,deposit_status,status,description,created_at,updated_at)
  VALUES (resident_application_id,resident_room_id,resident_student_id,
          timestamp '2026-09-01',timestamp '2027-08-31 23:59:59',750000,750000,'HELD','ACTIVE','DEMO12 resident contract',now(),now())
  ON CONFLICT (dorm_application_id) DO NOTHING;
  SELECT contract_id INTO resident_contract_id FROM contracts WHERE dorm_application_id=resident_application_id;

  INSERT INTO room_assignments (student_id,contract_id,room_id,assigned_by,assigned_at,check_in_at,status)
  SELECT resident_student_id,resident_contract_id,resident_room_id,manager_id,
         timestamp '2026-09-01',timestamp '2026-09-02','CHECKED_IN'
  WHERE NOT EXISTS (SELECT 1 FROM room_assignments WHERE contract_id=resident_contract_id AND student_id=resident_student_id);

  INSERT INTO maintenance_requests (student_id,room_id,title,description,maintenance_status,priority,type,created_at,updated_at)
  SELECT resident_student_id,resident_room_id,v.title,v.description,v.status,v.priority,v.type,now(),now()
  FROM (VALUES
    ('DEMO12 fan pending','Synthetic fan repair request','PENDING','MEDIUM','FAN'),
    ('DEMO12 light completed','Synthetic lighting repair request','COMPLETED','LOW','LIGHTING')
  ) AS v(title,description,status,priority,type)
  WHERE NOT EXISTS (SELECT 1 FROM maintenance_requests m WHERE m.student_id=resident_student_id AND m.title=v.title);

  IF EXISTS (
    SELECT 1 FROM notifications
    WHERE (title='DEMO12 room assigned' AND (type<>'ROOM_ASSIGNED' OR body<>'Synthetic room assignment notice'))
       OR (title='DEMO12 general notice' AND (type<>'GENERAL' OR body<>'Synthetic general notice'))
  ) THEN
    RAISE EXCEPTION 'A DEMO12 notification title already belongs to different content';
  END IF;
  INSERT INTO notifications (type,title,body,created_at)
  SELECT v.type,v.title,v.body,now()
  FROM (VALUES
    ('ROOM_ASSIGNED','DEMO12 room assigned','Synthetic room assignment notice'),
    ('GENERAL','DEMO12 general notice','Synthetic general notice')
  ) AS v(type,title,body)
  WHERE NOT EXISTS (SELECT 1 FROM notifications n WHERE n.title=v.title);
  INSERT INTO notification_receivers (notification_id,user_id,is_read)
  SELECT n.id,resident_id,false FROM notifications n
  WHERE n.title IN ('DEMO12 room assigned','DEMO12 general notice')
    AND NOT EXISTS (SELECT 1 FROM notification_receivers r WHERE r.notification_id=n.id AND r.user_id=resident_id);

  -- YearMonthAttributeConverter stores the first day of a month as DATE.
  INSERT INTO meter_readings (room_id,reading_month,electricity_old,electricity_new,water_old,water_new,electricity_price,water_price,status,created_at)
  SELECT resident_room_id,date '2026-10-01',100,120,50,55,3000,10000,'CONFIRMED',now()
  WHERE NOT EXISTS (SELECT 1 FROM meter_readings WHERE room_id=resident_room_id AND reading_month=date '2026-10-01');

  IF EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.room_id=resident_room_id
      AND i.billing_month IN (date '2026-09-01',date '2026-10-01')
      AND NOT EXISTS (
        SELECT 1 FROM invoice_details d
        WHERE d.invoice_id=i.invoice_id AND d.description LIKE 'DEMO12 %'
      )
  ) THEN
    RAISE EXCEPTION 'An existing non-DEMO12 invoice uses a demo room/month';
  END IF;
  INSERT INTO invoices (invoice_type,room_id,contract_id,billing_month,issue_date,due_date,status,total_amount)
  SELECT 'ROOM_FEE',resident_room_id,resident_contract_id,date '2026-09-01',
         timestamp '2026-09-01',timestamp '2026-09-15','UNPAID',750000
  WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE room_id=resident_room_id AND billing_month=date '2026-09-01');
  INSERT INTO invoices (invoice_type,room_id,billing_month,issue_date,due_date,status,total_amount)
  SELECT 'UTILITY',resident_room_id,date '2026-10-01',
         timestamp '2026-10-01',timestamp '2026-10-15','UNPAID',110000
  WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE room_id=resident_room_id AND billing_month=date '2026-10-01');
  SELECT invoice_id INTO room_fee_invoice_id FROM invoices
   WHERE room_id=resident_room_id AND billing_month=date '2026-09-01' AND invoice_type='ROOM_FEE';
  SELECT invoice_id INTO utility_invoice_id FROM invoices
   WHERE room_id=resident_room_id AND billing_month=date '2026-10-01' AND invoice_type='UTILITY';
  IF room_fee_invoice_id IS NULL OR utility_invoice_id IS NULL THEN
    RAISE EXCEPTION 'Existing room/month invoice conflicts with DEMO12 invoice';
  END IF;

  INSERT INTO invoice_details (invoice_id,item_type,description,quantity,unit_price,amount)
  SELECT v.invoice_id,v.item_type,v.description,v.quantity,v.unit_price,v.amount
  FROM (VALUES
    (room_fee_invoice_id,'ROOM','DEMO12 September room fee',1::numeric,750000::numeric,750000::numeric),
    (utility_invoice_id,'ELECTRICITY','DEMO12 October electricity',20::numeric,3000::numeric,60000::numeric),
    (utility_invoice_id,'WATER','DEMO12 October water',5::numeric,10000::numeric,50000::numeric)
  ) AS v(invoice_id,item_type,description,quantity,unit_price,amount)
  WHERE NOT EXISTS (SELECT 1 FROM invoice_details d WHERE d.invoice_id=v.invoice_id AND d.description=v.description);
END
$demo$;

COMMIT;
