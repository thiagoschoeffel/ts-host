# ADR 0017 — Registro global e propriedade das migrations

**Estado:** aceita para implementação  
**Data:** 8 de setembro de 2026

## Contexto

Organizações, usuários e associações já pertencem ao `AppDbContext`, que contém filtros e validação de escrita para o domínio operacional.

## Decisão

Evoluir as entidades existentes e manter `AppDbContext` como único dono do histórico de migrations. Consultas globais serão repositórios estreitos. Se um `PlatformRegistryDbContext` for necessário para reduzir superfície, ele reutilizará configurações de entidades e não criará migrations nem mapeará pedidos, mensagens ou pagamentos.

Não será usado `IgnoreQueryFilters()` genérico em casos de uso, tenant privilegiado, GUID especial ou flag `IsSuperTenant`. O estado da organização substituirá gradualmente `IsActive` com compatibilidade definida no baseline.

## Consequências

Migrations serão aditivas e testadas em PostgreSQL com dados existentes. IDs de organização, usuário e associação serão preservados.

