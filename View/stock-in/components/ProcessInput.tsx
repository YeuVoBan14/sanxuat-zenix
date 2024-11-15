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
  import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
  
  interface PropsType {
    open: boolean;
    setOpen: (value: boolean) => void;
    title: string;
    description: string;
    handleDel: MouseEventHandler<HTMLButtonElement>;
    loading: boolean;
  }
  
  export function ProcessInput(props: PropsType) {
    const { open, setOpen, title, description, handleDel, loading } = props;
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
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="focus:outline-none">
              Huỷ
            </AlertDialogCancel>
            {loading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Xin chờ
              </Button>
            ) : (
              <Button type="button" onClick={handleDel}>Xác nhận</Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  