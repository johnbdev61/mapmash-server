BEGIN;

INSERT INTO users
  (username, password)
VALUES
  ('kind-grader', '&Passkey123'),
  ('wade_thrillson117', '&Passkey456'),
  ('johnnyFrags123', '&Passkey789'),
  ('fire-starter312', '&Passkey101');

INSERT INTO mashes
  (game_title, notes, author_id)
VALUES
  ('Halo 3', 'This is a layout for Halo 3 that I call bumper jumper. You use left bumper to jump so you can keep your finger on the right stick and continue to sight your opponents', 1),
  ('Halo 3', 'I totally stole this layout from that other guy', 2),
  ('Halo 3', 'I think the default layout is the best layout', 3),
  ('Halo 3', 'I really do not like to use buttons', 4);

INSERT INTO bind
  (key_input, key_action, mash_id)
VALUES
  ('A Button', 'Switch Grenades', 1),
  ('B Button', 'Reload', 1),
  ('X Button', 'Melee', 1),
  ('Y Button', 'Change Weapon', 1),
  ('Right Bumper', 'Throw Grenade', 1),
  ('Left Bumper', 'Jump', 1),
  ('Right Trigger', 'Fire Weapon', 1),
  ('Left Trigger', 'Use Equipment', 1),
  ('Left Stick', 'Move', 1),
  ('Left Click', 'Crouch', 1),
  ('Right Stick', 'Look', 1),
  ('Right Click', 'Zoom', 1),
  ('A Button', 'Switch Grenades', 2),
  ('B Button', 'Reload', 2),
  ('X Button', 'Melee', 2),
  ('Y Button', 'Change Weapon', 2),
  ('Right Bumper', 'Throw Grenade', 2),
  ('Left Bumper', 'Jump', 2),
  ('Right Trigger', 'Fire Weapon', 2),
  ('Left Trigger', 'Use Equipment', 2),
  ('Left Stick', 'Move', 2),
  ('Left Click', 'Crouch', 2),
  ('Right Stick', 'Look', 2),
  ('Right Click', 'Zoom', 2),
  ('A Button', 'Jump', 3),
  ('B Button', 'Melee', 3),
  ('X Button', 'Use Equipment', 3),
  ('Y Button', 'Change Weapon', 3),
  ('Right Bumper', 'Reload', 3),
  ('Left Bumper', 'Switch Grenades', 3),
  ('Right Trigger', 'Fire Weapon', 3),
  ('Left Trigger', 'Throw Grenade', 3),
  ('Left Stick', 'Move', 3),
  ('Left Click', 'Crouch', 3),
  ('Right Stick', 'Look', 3),
  ('Right Click', 'Zoom', 3),
    ('A Button', 'Not Used', 4),
  ('B Button', 'Not Used', 4),
  ('X Button', 'Not Used', 4),
  ('Y Button', 'Not Used', 4),
  ('Right Bumper', 'Not Used', 4),
  ('Left Bumper', 'Not Used', 4),
  ('Right Trigger', 'Not Used', 4),
  ('Left Trigger', 'Not Used', 4),
  ('Left Stick', 'Not Used', 4),
  ('Left Click', 'Not Used', 4),
  ('Right Stick', 'Not Used', 4),
  ('Right Click', 'Not Used', 4);

INSERT INTO votes
  (is_upvote, mashes_id, users_id)
VALUES
  (true, 1, 2),
  (true, 1, 3),
  (true, 1, 4);

COMMIT;