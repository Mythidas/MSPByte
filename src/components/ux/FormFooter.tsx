'use client'

import { Separator } from "@/components/ui/separator";
import RouteButton from "@/components/ux/RouteButton";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { FormFooterProps } from "@/types";

type Props = {
  pending?: boolean;
} & FormFooterProps;

export default function FormFooter({ cancel_route, submit_text, pending_text, pending }: Props) {
  return (
    <>
      <Separator />
      <div className="flex justify-end gap-3">
        {cancel_route &&
          <RouteButton variant="outline" type="button" route={cancel_route} disabled={pending}>
            Cancel
          </RouteButton>
        }
        <SubmitButton variant="default" pendingText={pending_text} pending={pending}>
          {submit_text}
        </SubmitButton>
      </div>
    </>
  );
}