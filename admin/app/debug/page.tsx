export default function DebugPage() {
  return (
    <pre style={{ padding: 32, fontSize: 14 }}>
      {JSON.stringify({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
        anonKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 40) ?? 'MISSING',
      }, null, 2)}
    </pre>
  )
}
