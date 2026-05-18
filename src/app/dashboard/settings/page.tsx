"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  banner: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["restaurant-profile"],
    queryFn: async () => {
      const res = await api.get("/restaurant/profile");
      return res.data.data;
    },
  });

  const { register, control, handleSubmit, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: restaurant,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SettingsForm) => {
      await api.put("/restaurant/profile", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restaurant-profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Restaurant Settings</h2>
        <p className="text-text-muted text-sm mt-0.5">Update your restaurant information</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm">
          ✅ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutate(d))} id="settings-form" className="glass-card p-6 space-y-5">
        <div>
          <label className="label">Restaurant Name</label>
          <input className={`input ${errors.name ? "input-error" : ""}`} {...register("name")} />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} {...register("description")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register("phone")} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className={`input ${errors.email ? "input-error" : ""}`} {...register("email")} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <input className="input" {...register("address")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Controller
            control={control}
            name="logo"
            render={({ field }) => (
              <ImageUpload
                label="Logo"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="banner"
            render={({ field }) => (
              <ImageUpload
                label="Banner"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <button type="submit" id="settings-save-btn" disabled={isPending} className="btn-primary">
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Settings</>
          )}
        </button>
      </form>
    </div>
  );
}
