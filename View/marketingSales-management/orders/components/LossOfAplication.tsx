import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'

export default function LossOfAplication({
  dataList,
  quote_code,
}: {
  dataList: any;
  quote_code?: string;
}) {


  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          {quote_code}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Mất đơn</DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogTitle>Lý do mất đơn</DialogTitle>
        <Textarea readOnly value={dataList?.reasonFail} />
      </DialogContent>
    </Dialog>
  )
}
