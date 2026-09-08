# ADR 0020 — E-mail transacional com Resend

**Estado:** aceita para implementação  
**Data:** 8 de setembro de 2026

## Decisão

O Resend é o provedor de e-mail transacional da V1. A API chama `POST /emails` por um adapter de infraestrutura e usa `Idempotency-Key` por convite. API key, remetente verificado e URL pública de aceite são configurações exclusivas do backend.

Convites armazenam somente SHA-256 do token. O link é enviado ao e-mail convidado, expira em sete dias e só pode ser consumido uma vez por uma identidade OIDC cujo claim `email` corresponda ao destinatário. Reemitir revoga o convite pendente anterior.

## Consequências

Produção precisa de um domínio ou subdomínio verificado no Resend, com SPF e DKIM. A indisponibilidade do provedor não desfaz silenciosamente o convite persistido; a operação durável e suas retentativas serão consolidadas na S04.
