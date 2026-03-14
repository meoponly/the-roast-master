INSERT INTO public.user_roles (user_id, role)
VALUES ('2e2f1412-87d1-47f7-b769-fa308a93d8ae', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;