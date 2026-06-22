/* =========================================================
   AMBIENTE PADRÃO (usado no `ng serve` / desenvolvimento)
   ---------------------------------------------------------
   Credenciais do Supabase (Project Settings > API).
   A chave usada é a Publishable Key (sb_publishable_...), que é
   pública por design e protegida pelas policies de RLS.
   ========================================================= */
export const environment = {
  production: false,
  // Domínio oficial (fonte única para SEO). Placeholder até definição do domínio real.
  siteUrl: 'https://barbeariapalmares.com.br',
  supabaseUrl: 'https://urghwjhjxfscgwlyuaon.supabase.co',
  supabaseAnonKey: 'sb_publishable_AX7HL89dHrd1d1jjTRoEQw_hPSYBhnO',
};
