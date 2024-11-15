import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ButtonProps } from "./ui/button";

export function AlertDialogForm({
  action,
  title,
  content,
  textCancel,
  textOk,
  handleSubmit,
}: {
  action: any;
  title: string;
  content?: string;
  textCancel?: string;
  textOk?: string;
  handleSubmit: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="w-full">{action}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {textCancel ? textCancel : "Hủy"}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-blue-500 hover:bg-blue-800 text-white hover:text-white border shadow-lg"
            onClick={handleSubmit}
          >
            {textOk ? textOk : "Đồng ý"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
