import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { MouseEventHandler, useEffect } from "react";
  import { Button } from "@/components/ui/button";
  import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
  
  interface PropsType {
    open: boolean;
    setOpen: (value: boolean) => void;
    title: string;
    description: string;
    handleCancel: MouseEventHandler<HTMLButtonElement>;
    loading: boolean;
    value: string;
    setValue: (value: string) => void;
  }
  
  export function CancelForm(props: PropsType) {
    const { open, setOpen, title, description, handleCancel, loading, value, setValue } = props;
    useEffect(() => {
      if (!loading) {
        setOpen(false);
      }
    }, [loading]);
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        {/* <AlertDialogTrigger asChild>
            <Button variant="outline">Show Dialog</Button>
          </AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
            <Textarea 
                placeholder="Nhập nội dung"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="focus:outline-none">
              Quay lại
            </AlertDialogCancel>
            {loading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button onClick={handleCancel}>Xác nhận</Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  