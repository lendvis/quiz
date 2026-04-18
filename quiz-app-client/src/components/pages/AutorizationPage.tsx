import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../buttons/Button";
import { Loadable } from "../common/Loadable";
import { AuthInput } from "../../features/auth/components/AuthInput";
import type { ApiError } from "../../api/api-error";
import { ThemeToggleButton } from "../ThemeToggleButton";

export type FieldOption = {
  label: string;
  value: string;
};

export type FieldConfig = {
  name: string;
  label?: string;
  placeholder?: string;
  type: "text" | "password" | "radio" | "select" | "checkbox";
  options?: FieldOption[];
  required?: boolean;
  visibleWhen?: (formData: Record<string, any>) => boolean;
};

export interface AuthorizationPageProps<T> {
  title: string;
  description?: string;
  fields: FieldConfig[];
  initialFormState: T;
  submitLabel: string;
  submitHandler: (data: T) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: ApiError | null;
  link?: { text: string; to: string; toText: string };
  isSuccess: boolean | null;
}

export const AuthorizationPage = <T extends Record<string, any>>({
  title,
  description,
  fields,
  initialFormState,
  submitLabel,
  submitHandler,
  isSubmitting,
  error,
  link
}: AuthorizationPageProps<T>) => {
  const [formData, setFormData] = useState<T>(initialFormState);
  const sendedData = useRef<Partial<T>>(initialFormState);

  const handleChange = (field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    sendedData.current = formData;
    submitHandler(formData as T);
  };

  const isDirty = <K extends keyof T>(field: K): boolean => {
    return formData[field] !== sendedData.current[field];
  };

  return (
    <div className="auth-shell h-full w-full flex items-stretch flex-row relative">
      <ThemeToggleButton compact className="theme-toggle--floating" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="theme-text-primary hidden lg:flex flex-1 items-center justify-center p-10 relative z-10">
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">Платформа тестирования</h2>
          <p className="theme-text-secondary text-lg leading-relaxed">
            Создавайте курсы, назначайте тесты группам и отслеживайте результат с прозрачной аналитикой.
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-row justify-center text-slate-800 p-4 sm:p-8 relative z-10">
        <div className="flex flex-col max-w-lg items-stretch content-stretch px-8 sm:px-10 w-full justify-stretch bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col content-stretch justify-center w-full h-full py-8"
          >
            <h1 className="text-black mb-2 text-3xl font-semibold">{title}</h1>
            {description && <p className="text-slate-500 mb-6">{description}</p>}

            {fields.map((field, i) => {
              if (field.visibleWhen && !field.visibleWhen(formData)) {
                return null;
              }

              const fieldKey = field.name as keyof T;
              const fieldValue = formData[fieldKey] as any;

              return (
                <div key={i} className="mb-3">
                  {field.label && <label className="mb-1 block text-gray-700">{field.label}</label>}

                  {field.type === "text" || field.type === "password" ? (
                    <AuthInput
                      type={field.type}
                      value={fieldValue ?? ""}
                      required={field.required ?? true}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.name as keyof T, e.target.value)}
                      error={
                        !isDirty(field.name) &&
                        error?.errors?.[field.name.toString()] || null
                      }
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={fieldValue ?? ""}
                      onChange={(e) => handleChange(field.name as keyof T, e.target.value)}
                      required={field.required ?? true}
                      className="border border-slate-200 outline-none focus:border-indigo-500 ring-4 ring-transparent focus:ring-indigo-100 transition-all p-3 rounded-lg w-full bg-slate-50 text-slate-800 font-medium hover:bg-white"
                    >
                      <option value="">{field.placeholder || "Выберите значение"}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "radio" ? (
                    <div className="flex flex-col gap-1">
                      {field.options?.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={field.name}
                            value={opt.value}
                            checked={fieldValue === opt.value}
                            onChange={(e) =>
                              handleChange(field.name as keyof T, e.target.value)
                            }
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!fieldValue}
                        onChange={(e) =>
                          handleChange(field.name as keyof T, e.target.checked)
                        }
                      />
                      {field.label || field.placeholder}
                    </label>
                  ) : null}
                </div>
              );
            })}

            <div className="flex flex-col content-stretch mt-2 gap-2">
              <Button type="submit">
                <Loadable loading={isSubmitting || false}>{submitLabel}</Loadable>
              </Button>

              {link && (
                <div className="flex gap-1 justify-center">
                  <span>{link.text} </span>
                  <Link to={link.to}>{link.toText}</Link>
                </div>
              )}
            </div>

            {error && !error.errors && !isSubmitting && (
              <div className="transition mt-5 border-3 p-2 rounded bg-red-300 border-red-500 text-red-900">
                {error.message ? (
                  <p>{error.message}</p>
                ) : (
                  <p>Произошла неизвестная ошибка</p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
