"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Field, SelectField } from "@/components/field";
import { IconByName } from "@/components/icon-by-name";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { permissionsFor } from "@/lib/rbac";
import { useCurrentUser, useStore } from "@/lib/store";
import type { CatalogItem } from "@/lib/types";

function defaultsFor(item: CatalogItem): Record<string, string> {
  const defaults: Record<string, string> = {};
  item.fields.forEach((field) => {
    if (field.type === "select" && field.options?.[0]) {
      defaults[field.name] = field.options[0];
    } else if (field.type === "number") {
      defaults[field.name] = "1";
    } else {
      defaults[field.name] = "";
    }
  });
  return defaults;
}

export function RequestDialog({
  item,
  open,
  onOpenChange,
}: {
  item: CatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <RequestForm key={item.id} item={item} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function RequestForm({
  item,
  onClose,
}: {
  item: CatalogItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const user = useCurrentUser();
  const users = useStore((state) => state.users);
  const createRequest = useStore((state) => state.createRequest);
  const permissions = permissionsFor(user);

  const [values, setValues] = useState<Record<string, string>>(() => defaultsFor(item));
  const [requestedFor, setRequestedFor] = useState(user?.id ?? "");

  const userOptions = useMemo(
    () => users.map((entry) => ({ value: entry.id, label: `${entry.name} · ${entry.department}` })),
    [users],
  );

  function submit() {
    if (!user) return;
    const missing = item.fields.find(
      (field) => field.required && !values[field.name]?.trim(),
    );
    if (missing) {
      toast.error(`${missing.label} is required`);
      return;
    }
    const request = createRequest({
      item,
      requestedForId: permissions.canManageTickets ? requestedFor : user.id,
      requestedById: user.id,
      values,
    });
    onClose();
    toast.success(`${request.number} submitted`);
    router.push("/requests");
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconByName name={item.icon} className="size-5" />
          </span>
          <div>
            <DialogTitle>Request {item.name}</DialogTitle>
            <DialogDescription>{item.shortDescription}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
        {permissions.canManageTickets ? (
          <Field label="Requested for">
            <SelectField
              value={requestedFor}
              onValueChange={setRequestedFor}
              options={userOptions}
            />
          </Field>
        ) : null}

        {item.fields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            htmlFor={`field-${field.name}`}
            required={field.required}
          >
            {field.type === "textarea" ? (
              <Textarea
                id={`field-${field.name}`}
                rows={3}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
              />
            ) : field.type === "select" ? (
              <SelectField
                value={values[field.name] ?? ""}
                onValueChange={(value) =>
                  setValues((current) => ({ ...current, [field.name]: value }))
                }
                options={(field.options ?? []).map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            ) : (
              <Input
                id={`field-${field.name}`}
                type={field.type === "number" ? "number" : "text"}
                min={field.type === "number" ? 1 : undefined}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
              />
            )}
          </Field>
        ))}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <ShoppingCart className="size-4" />
          Submit request
        </Button>
      </DialogFooter>
    </>
  );
}
