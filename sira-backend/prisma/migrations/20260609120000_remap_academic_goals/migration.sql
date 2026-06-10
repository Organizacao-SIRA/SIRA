-- Remapeia objetivos acadêmicos legados para o novo eixo de "propósito".
-- 'Estudo introdutório' e 'Aprofundamento técnico' deixaram de ser objetivos
-- (profundidade agora vive em materialLevels) e colapsam em 'Estudo de disciplina'.
-- Idempotente: re-execuções são no-op (os valores antigos deixam de existir).
UPDATE "User"
SET "academicGoal" = 'Estudo de disciplina'
WHERE "academicGoal" IN ('Estudo introdutório', 'Aprofundamento técnico');
