'use client'

import { AlertDialogForm } from '@/components/AlertDialogForm'
import { Paginations } from '@/components/Pagination'
import { DataTable } from '@/components/ui/custom/data-table'
import { toast } from '@/components/ui/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { getAllUser, putLockUser, resetPassword } from '@/api/user'
import CreateAndUpdateUser from './components/CreateAndUpdateUser'
import { returnTextDepartment } from '@/lib/return-text'
import LoadingView from '@/components/LoadingView'
import ErrorViews from '@/components/ErrorViews'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import SearchInput from '@/components/SearchInput'

export const returnColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-500'
      break
    case 'manager':
      return 'bg-blue-400'
      break
    case 'staff':
      return 'bg-gray-400'
      break
    default:
      break
  }
}

export function UserList() {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<{ role: string }>()
  const [searchValue, setSearchValue] = useState<string>('')
  const [functions, setFunctions] = useState(false)

  const [pagination, setPagination] = useState<{
    keySearch: string
  }>({
    keySearch: ''
  })
  const {
    data: userList,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['allUser', pagination],
    queryFn: () => getAllUser(pagination)
  })

  useEffect(() => {
    const timeId = setTimeout(() => {
      setPagination({ ...pagination, keySearch: searchValue })
    }, 500)
    return () => clearTimeout(timeId)
  }, [searchValue])

  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10
  const [openAlert, setOpenAlert] = useState<boolean>(false)
  const [userId, setUserId] = useState<number>(0)

  const pageCount = userList ? Math.ceil(userList?.data?.length / pageSize) : 0
  const currentData = userList?.data?.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const userJson = JSON.parse(userData)
      setUser(userJson)
    }
  }, [])

  const mutation = useMutation({
    mutationFn: putLockUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['allUser']
      })
      toast({
        title: 'Thành công',
        description: `${data?.message}`
      })
    },
    onError: (error) => {
      toast({
        title: 'Thất bại',
        description: `${error?.message}`
      })
    }
  })

  const handleLock = async (id: number) => {
    await mutation.mutateAsync(id)
  }

  const columns: ColumnDef<any>[] = [
    {
      header: 'STT',
      cell: ({ row }) => {
        return <div className='capitalize'>{row['index'] + 1 + currentPage * pageSize}</div>
      }
    },
    {
      accessorKey: 'userName',
      header: 'Tài khoản',
      cell: ({ row }) => (
        <div className='flex gap-2.5'>
          <div className='w-[80px]'>
            <div
              className={`border ${returnColor(
                row?.original?.role
              )} text-center rounded-xl p-0.5 text-xs font-medium text-white`}
            >
              {row?.original?.role.toUpperCase()}
            </div>
          </div>
          {row.getValue('userName')}
        </div>
      )
    },
    {
      accessorKey: 'fullName',
      header: 'Họ tên',
      cell: ({ row }) => <div>{row.getValue('fullName')}</div>
    },
    {
      accessorKey: 'phoneNumber',
      header: 'SĐT',
      cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>
    },
    {
      accessorKey: 'department',
      header: 'Phòng ban',
      cell: ({ row }) => <div>{returnTextDepartment(row?.original?.department)}</div>
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <AlertDialogForm
          title={`Bạn muốn ${row?.original?.isActive ? 'khóa' : 'mở'} tài khoản này?`}
          action={
            (
              <div className='px-2 py-1 cursor-pointer'>
                <div
                  className={`border ${row?.original?.isActive ? 'bg-green-200 text-green-700' : 'bg-red-500 text-white'
                    } text-center rounded-xl p-0.5 font-medium`}
                >
                  {row?.original?.isActive ? 'Active' : 'Locked'}
                </div>
              </div>
            ) as any
          }
          handleSubmit={() => handleLock(row.original['id'])}
        />
      )
    },
    {
      id: 'password',
      header: '',
      cell: ({ row }) => {
        return (
          <p
            className='underline text-xs cursor-pointer text-center'
            onClick={() => {
              setOpenAlert(true)
              setUserId(row.original['id'])
            }}
          >
            Đổi mật khẩu
          </p>
        )
      }
    },
    {
      id: 'id',
      header: '',
      cell: ({ row }: { row: any }) => {
        return (
          <div className='flex justify-end'>
            <CreateAndUpdateUser edit={true} dataList={row.original} />
          </div>
        )
      }
    }
  ]

  const handleExportExcel = (data: any) => {
    const dataToExport = data.map((item: any) => ({
      username: item.userName,
      fullName: item.fullName,
      phoneNumber: item.phoneNumber,
      email: item.email,
      department: returnTextDepartment(item.department),
      status: item.isActive ? 'Active' : 'Locked'
    }),);
    const heading = [["Tài khoản", "Họ tên", "Số điện thoại", "Email", "Phòng ban", "Trạng thái"]];
    // Create Excel workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, heading);
    XLSX.utils.sheet_add_json(ws, dataToExport, { origin: 'A2', skipHeader: true });
    // const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, ws, "Dữ liệu người dùng");
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `nguoidung.xlsx`);
  }

  // if (isLoading) return <LoadingView />

  if (error instanceof Error && "response" in error) {
    const status = (error as any).response?.status;
    const type = (error as any).response?.type;
    const statusText = (error as any).response?.statusText;
    const message = (error as any).response?.data?.message;
    return (
      <ErrorViews status={status} statusText={statusText} message={message} type={type} />
    );
  }

  return (
    <div className='w-full'>
      <div className='flex  py-2 justify-end items-end'>
        <div className='flex justify-between w-full mb-2' onClick={() => setFunctions(false)}>
          <div className='flex justify-between items-center'>
            <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} placeholder='Tìm kiếm người dùng' />
          </div>
          <div className='flex'>{/* <AddAndUpdateQuotation /> */}</div>
        </div>
        <div className='flex'>
          <CreateAndUpdateUser />
          <Button onClick={() => handleExportExcel(currentData)} className='ml-2' variant={"outline"}>Xuất Excel</Button>
        </div>
      </div>
      {isLoading ? (
        <div className='flex justify-center items-center mt-64'>
          <div className='text-center'>
            <div className='w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto'></div>
            <h2 className='text-zinc-900 dark:text-white mt-4'>Loading...</h2>
          </div>
        </div>
      ) : (
        <>
          <DataTable
            data={currentData || []}
            columns={user?.role === 'admin' ? columns : columns.filter((item: any) => item.id !== 'password')}
          />
          <div className='mt-5 flex justify-end'>
            <Paginations currentPage={currentPage} pageCount={pageCount} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
      <ResetPassword id={userId} refetch={refetch} openAlert={openAlert} setOpenAlert={setOpenAlert} />
    </div>
  )
}

const ResetPassword = ({
  id,
  refetch,
  openAlert,
  setOpenAlert
}: {
  id: number
  refetch: any
  openAlert: boolean
  setOpenAlert: any
}) => {
  const [newPassword, setNewPassword] = useState<string>()
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const mutationReset = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['resetPassword']
      })
      refetch()
      toast({
        title: 'Thành công',
        description: 'Cập nhật mật khẩu thành công'
      })
      setNewPassword('')
      setOpenAlert(false)
      setOpenDialog(false)
    },
    onError: (error) => {
      console.error('Đã xảy ra lỗi khi gửi:', error)
      toast({
        title: 'Thất bại',
        description: 'Cập nhật mật khẩu thất bại'
      })
    }
  })

  const handleSubmit = (data: string) => {
    mutationReset.mutate({ data, id })
  }

  return (
    <>
      <Dialog open={openAlert} onOpenChange={setOpenAlert}>
        <DialogContent className='sm:max-w-[520px]'>
          <DialogHeader>
            <DialogTitle>Thay đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='Nhập mật khẩu mới' />
          <div className='flex justify-end'>
            <DialogClose>
              <Button variant={'outline'} className='mr-2'>
                Huỷ
              </Button>
            </DialogClose>
            <Button type='button' onClick={() => setOpenDialog(true)}>
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{'Xác nhận thay đổi mật khẩu'}</AlertDialogTitle>
            <AlertDialogDescription>Bạn có thực sự muốn thay đổi mật khẩu???</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='focus:outline-none'>Huỷ</AlertDialogCancel>
            {mutationReset.isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Xin chờ
              </Button>
            ) : (
              <Button type='button' onClick={() => newPassword && handleSubmit(newPassword)}>
                Xác nhận
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
