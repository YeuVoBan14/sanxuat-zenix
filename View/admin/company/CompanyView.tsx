'use client'
import React from 'react'
import Tab from '@/components/Tab'
import { UserList } from './UserList'
import CompanyInfos from './components/CompanyInfo'
import { useQuery } from '@tanstack/react-query'
import { getAllUser } from '@/api/user'

export function CompanyView() {
  const { data: userList } = useQuery({
    queryKey: ['allUser'],
    queryFn: () => getAllUser({ keySearch: '' })
  })

  const items = [
    {
      key: 1,
      label: 'Tài khoản',
      children: <UserList />,
      quantity: userList?.data?.length
    },
    {
      key: 2,
      label: 'Thông tin công ty',
      children: <CompanyInfos />
    }
  ]

  return (
    <>
      <Tab defaults={items} defaultValue={1} />
    </>
  )
}
