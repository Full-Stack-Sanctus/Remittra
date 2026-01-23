import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'

type UserRow = {
  id: string
  email: string
  kyc_verified: boolean
}

type AjoRow = {
  id: string
  name: string
  current_cycle: number
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [ajos, setAjos] = useState<AjoRow[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, kyc_verified')

      if (!usersError && usersData) {
        setUsers(usersData)
      }

      const { data: ajosData, error: ajosError } = await supabase
        .from('ajos')
        .select('id, name, current_cycle')

      if (!ajosError && ajosData) {
        setAjos(ajosData)
      }
    }

    fetchData()
  }, [])

  const toggleKYC = async (userId: string, verified: boolean) => {
    await supabase
      .from('users')
      .update({ kyc_verified: !verified })
      .eq('id', userId)

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, kyc_verified: !verified } : u
      )
    )
  }

  const advanceCycle = async (ajoId: string) => {
    const ajo = ajos.find((a) => a.id === ajoId)
    if (!ajo) return

    const nextCycle = ajo.current_cycle + 1

    await supabase
      .from('ajos')
      .update({ current_cycle: nextCycle })
      .eq('id', ajoId)

    setAjos((prev) =>
      prev.map((a) =>
        a.id === ajoId ? { ...a, current_cycle: nextCycle } : a
      )
    )

    alert('Cycle advanced (demo)')
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>

      <h2 className="font-semibold mb-2">Users</h2>
      <div className="mb-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="border p-2 mb-2 rounded flex justify-between items-center"
          >
            <span>{user.email}</span>
            <span>KYC: {user.kyc_verified ? '✅' : '❌'}</span>
            <Button onClick={() => toggleKYC(user.id, user.kyc_verified)}>
              {user.kyc_verified ? 'Unverify' : 'Verify'}
            </Button>
          </div>
        ))}
      </div>

      <h2 className="font-semibold mb-2">Ajo Groups</h2>
      {ajos.map((ajo) => (
        <div
          key={ajo.id}
          className="border p-2 mb-2 rounded flex justify-between items-center"
        >
          <span>
            {ajo.name} — Cycle {ajo.current_cycle}
          </span>
          <Button onClick={() => advanceCycle(ajo.id)}>
            Advance Cycle
          </Button>
        </div>
      ))}
    </div>
  )
}
