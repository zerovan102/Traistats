// Supabase REST API client - kompatibel dengan format kunci API baru (sb_publishable_...)
// Menggantikan @supabase/supabase-js yang tidak kompatibel dengan format kunci baru

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const baseHeaders: Record<string, string> = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

type SupabaseResponse<T = any> = { data: T | null; error: any };

async function restGet(table: string, params: Record<string, string> = {}): Promise<SupabaseResponse> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs ? '?' + qs : ''}`, { headers: baseHeaders });
  if (res.ok) return { data: await res.json(), error: null };
  return { data: null, error: await res.json() };
}

async function restPost(table: string, body: any): Promise<SupabaseResponse> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...baseHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    const data = await res.json();
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  }
  return { data: null, error: await res.json() };
}

async function restPatch(table: string, filter: Record<string, string>, body: any): Promise<SupabaseResponse> {
  const qs = Object.entries(filter).map(([k, v]) => `${k}=eq.${v}`).join('&');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    method: 'PATCH',
    headers: { ...baseHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    const data = await res.json();
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  }
  return { data: null, error: await res.json() };
}

async function restDelete(table: string, filter: Record<string, string>): Promise<SupabaseResponse> {
  const qs = Object.entries(filter).map(([k, v]) => `${k}=eq.${v}`).join('&');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    method: 'DELETE',
    headers: baseHeaders,
  });
  if (res.ok) return { data: null, error: null };
  return { data: null, error: await res.json() };
}

// Builder pattern yang kompatibel dengan supabase-js API
function createQueryBuilder(table: string) {
  const state: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    filter: Record<string, string>;
    params: Record<string, string>;
    body?: any;
    wantSingle?: boolean;
  } = { method: 'GET', filter: {}, params: {} };

  const builder: any = {
    select(columns = '*') {
      state.params.select = columns;
      return builder;
    },
    order(column: string, opts?: { ascending?: boolean }) {
      state.params.order = `${column}.${opts?.ascending === false ? 'desc' : 'asc'}`;
      return builder;
    },
    eq(col: string, val: any) {
      state.filter[col] = String(val);
      return builder;
    },
    match(filter: Record<string, any>) {
      Object.assign(state.filter, Object.fromEntries(Object.entries(filter).map(([k, v]) => [k, String(v)])));
      return builder;
    },
    insert(rows: any[]) {
      state.method = 'POST';
      state.body = rows[0];
      return builder;
    },
    update(updates: any) {
      state.method = 'PATCH';
      state.body = updates;
      return builder;
    },
    delete() {
      state.method = 'DELETE';
      return builder;
    },
    upsert(rows: any[]) {
      state.method = 'POST';
      state.body = rows[0];
      return builder;
    },
    single() {
      state.wantSingle = true;
      return builder;
    },
    // Membuat builder ini bisa di-await
    then(resolve: (val: SupabaseResponse) => void, reject?: (err: any) => void) {
      const execute = async (): Promise<SupabaseResponse> => {
        if (state.method === 'DELETE') return restDelete(table, state.filter);
        if (state.method === 'PATCH') return restPatch(table, state.filter, state.body);
        if (state.method === 'POST') return restPost(table, state.body);
        // GET
        const filterQs = Object.entries(state.filter).reduce((acc, [k, v]) => ({ ...acc, [k]: `eq.${v}` }), {});
        return restGet(table, { ...state.params, ...filterQs });
      };
      return execute().then(resolve, reject);
    },
  };
  return builder;
}

export const supabase = {
  from: (table: string) => createQueryBuilder(table),
};
