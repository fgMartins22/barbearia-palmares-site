/* =========================================================
   AMBIENTE DE PRODUÇÃO (build de produção / deploy na Vercel)
   ---------------------------------------------------------
   Mesmos valores do environment.ts por enquanto.
   A chave é a Publishable Key (sb_publishable_...), pública por
   design e protegida pelas policies de RLS no Supabase.
   ========================================================= */
export const environment = {
  production: true,
  // Domínio oficial (fonte única para SEO). Placeholder até definição do domínio real.
  siteUrl: 'https://barbeariapalmares.com.br',
  supabaseUrl: 'https://urghwjhjxfscgwlyuaon.supabase.co',
  supabaseAnonKey: 'sb_publishable_AX7HL89dHrd1d1jjTRoEQw_hPSYBhnO',
};
