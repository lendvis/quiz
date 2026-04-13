import type { FC } from "react";
import { useDialog } from "../../../context/DialogContext";


type MyDialogProps = {
  userId: string;
};

const MyDialog: FC<MyDialogProps> = ({ userId }) => {
  const { closeDialog } = useDialog();

  const handleSave = () => {
    console.log("save user:", userId);
    closeDialog();
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Edit user
      </h2>

      <p className="mb-6 text-gray-600">
        User ID: {userId}
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>

        <button
          onClick={closeDialog}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MyDialog;