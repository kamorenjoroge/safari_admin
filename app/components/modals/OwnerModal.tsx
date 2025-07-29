// components/Modal/OwnerModal.tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiX, FiUser } from "react-icons/fi";

// Dynamically import form component
const OwnerForm = dynamic(() => import("../forms/CarOwnerForm"), {
  loading: () => <p className="text-dark">Loading form...</p>,
});

type OwnerActionType = "create" | "update" | "delete";

export interface Owner {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  cars: {
    _id: string;
    model: string;
    regestrationNumber: string;
    type: string;
    year: number;
    image: string;
  }[];
  id?: string;
}

type OwnerModalProps = {
  type: OwnerActionType;
  data?: Owner;
  id?: string;
  onSuccess?: () => void;
  children?: React.ReactNode; // For custom trigger button
};

const iconMap = {
  create: <FiPlus className="h-5 w-5" />,
  update: <FiEdit className="h-5 w-5" />,
  delete: <FiTrash2 className="h-5 w-5" />,
};

const buttonClassMap = {
  create: "inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium",
  update: "text-amber-500 hover:text-amber-700",
  delete: "text-red-600 hover:text-red-900",
};

const modalTitleMap = {
  create: "Add New Car Owner",
  update: "Edit Car Owner",
  delete: "Delete Car Owner",
};

const tooltipMap = {
  create: "Add a new car owner",
  update: "Edit car owner",
  delete: "Delete car owner",
};

const OwnerModal: React.FC<OwnerModalProps> = ({ 
  type, 
  data, 
  id, 
  onSuccess,
  children 
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/carowners/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Car owner deleted successfully");
        onSuccess?.();
        setOpen(false);
      } else {
        const result = await res.json();
        toast.error("Delete failed: " + (result.error || "Unknown error"));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("Error: " + err.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case "create":
        return (
          <OwnerForm
            type="create"
            onSuccess={() => {
              setOpen(false);
              onSuccess?.();
            }}
          />
        );
      case "update":
        return id ? (
          <OwnerForm
            type="update"
            ownerId={id}
            ownerData={data ? {
              name: data.name,
              email: data.email,
              phone: data.phone,
              location: data.location,
              joinedDate: data.joinedDate,
              status: data.status,
              cars: data.cars
            } : undefined}
            onSuccess={() => {
              setOpen(false);
              onSuccess?.();
            }}
          />
        ) : (
          <p className="text-dark">No car owner ID provided for update</p>
        );
      case "delete":
        return (
          <div className="text-center flex flex-col items-center gap-6 p-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FiUser className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-dark">
              Are you sure you want to delete this car owner?
            </p>
            {data && (
              <>
                <p className="text-sm text-gray-600">
                  Owner: <strong>{data.name}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {data.cars.length} {data.cars.length === 1 ? 'car' : 'cars'} will be unassigned
                </p>
              </>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-dark"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70"
              >
                {isLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        );
      default:
        return <p className="text-dark">Invalid action</p>;
    }
  };

  return (
    <>
      {/* Custom trigger or default button */}
      {children ? (
        <div onClick={() => setOpen(true)}>
          {children}
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => setOpen(true)}
            className={buttonClassMap[type]}
            aria-label={type}
          >
            {type === 'create' ? (
              <>
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                Add Car Owner
              </>
            ) : (
              iconMap[type]
            )}
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
            {tooltipMap[type]}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-dark/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-bold text-dark">
                {modalTitleMap[type]}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerModal;