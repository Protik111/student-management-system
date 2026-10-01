"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { enrollSelf } from "@/lib/actions/course-enrollments";

export default function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function enroll() {
    setPending(true);
    const r = await enrollSelf(courseId);
    setPending(false);
    if (!r.ok) {
      toast.error({ title: "Couldn't enroll", description: r.error });
      return;
    }
    toast.success({ title: "You're enrolled" });
    router.refresh();
  }

  return (
    <Button onClick={enroll} loading={pending}>
      Enroll now
    </Button>
  );
}