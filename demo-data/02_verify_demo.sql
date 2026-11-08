-- Read-only verification after an approved manual seed run.
-- Do not select password_hash or any token/cookie fields.

SELECT u.id AS user_id, u.username, u.role, u.status,
       s.id AS student_id, s.student_code, s.gender,
       (s.date_of_birth IS NOT NULL AND s.address IS NOT NULL) AS profile_complete
FROM users u LEFT JOIN students s ON s.user_id = u.id
WHERE u.username IN (
  'demo12-new','demo12-pending','demo12-rejected','demo12-resident',
  'demo12-locked','demo12-incomplete','demo12-female'
)
ORDER BY u.username;

SELECT b.building_code, b.gender_restriction, r.id AS room_id,
       r.room_number, r.room_type, r.capacity, r.current_occupancy, r.status
FROM rooms r JOIN buildings b ON b.id = r.building_id
WHERE b.building_code IN ('DEMO12-M','DEMO12-F')
ORDER BY b.building_code, r.room_number;

SELECT u.username, d.id AS application_id, d.status, b.building_code,
       r.room_number, d.note
FROM dorm_applications d
JOIN students s ON s.id = d.student_id
JOIN users u ON u.id = s.user_id
JOIN rooms r ON r.id = d.requested_room_id
JOIN buildings b ON b.id = r.building_id
WHERE u.username LIKE 'demo12-%'
ORDER BY u.username, d.id;

SELECT u.username, c.contract_id, c.status AS contract_status,
       a.assignment_id, a.status AS assignment_status,
       r.room_number, a.check_in_at
FROM contracts c
JOIN students s ON s.id = c.student_id
JOIN users u ON u.id = s.user_id
JOIN rooms r ON r.id = c.room_id
LEFT JOIN room_assignments a ON a.contract_id = c.contract_id
WHERE u.username = 'demo12-resident';

SELECT u.username, m.id AS maintenance_id, m.title,
       m.maintenance_status, m.priority, m.type
FROM maintenance_requests m
JOIN students s ON s.id = m.student_id
JOIN users u ON u.id = s.user_id
WHERE u.username = 'demo12-resident'
ORDER BY m.id;

SELECT u.username, n.id AS notification_id, n.title,
       nr.id AS receiver_id, nr.is_read
FROM notification_receivers nr
JOIN notifications n ON n.id = nr.notification_id
JOIN users u ON u.id = nr.user_id
WHERE u.username = 'demo12-resident' AND n.title LIKE 'DEMO12 %'
ORDER BY n.id;

SELECT b.building_code, r.room_number, mr.reading_month,
       mr.electricity_new - mr.electricity_old AS electricity_units,
       mr.water_new - mr.water_old AS water_units, mr.status
FROM meter_readings mr
JOIN rooms r ON r.id = mr.room_id
JOIN buildings b ON b.id = r.building_id
WHERE b.building_code = 'DEMO12-M' AND r.room_number = 'D12-M102'
ORDER BY mr.reading_month;

SELECT i.invoice_id, i.invoice_type, i.billing_month, i.status,
       i.total_amount, count(d.detail_id) AS detail_count,
       coalesce(sum(d.amount),0) AS detail_total
FROM invoices i
JOIN rooms r ON r.id = i.room_id
JOIN buildings b ON b.id = r.building_id
LEFT JOIN invoice_details d ON d.invoice_id = i.invoice_id
WHERE b.building_code = 'DEMO12-M' AND r.room_number = 'D12-M102'
GROUP BY i.invoice_id, i.invoice_type, i.billing_month, i.status, i.total_amount
ORDER BY i.billing_month;
