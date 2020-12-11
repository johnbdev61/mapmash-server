SELECT * FROM mashes m, users u, bind b
WHERE m.author_id = u.id and m.id = b.mash_id
SELECT * FROM bind WHERE bind.mash_id = 1