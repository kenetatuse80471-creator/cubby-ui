import { useId, useState, type ReactNode } from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/registry/cubby/ui/button";
import { Divider } from "@/registry/cubby/ui/divider";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";
import { Snackbar } from "@/registry/cubby/ui/snackbar";
import { Switch } from "@/registry/cubby/ui/switch";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  modalPopupVariants,
  type ModalSize,
} from "@/registry/cubby/ui/modal";
import { DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

/**
 * A modal lives in a portal over the whole window, and a screenshot is taken
 * of the demo section — so the open states below are the very same surface
 * rendered in place, out of the portal, from the very same parts and classes
 * (`modalPopupVariants` + `Modal*`). The live modal underneath is the real
 * one, for checking focus, Esc and the scrim by hand.
 */
function StaticModal({
  size = "sm",
  title,
  description,
  footer,
  children,
}: {
  size?: ModalSize;
  title: string;
  description?: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div data-slot="modal" className={modalPopupVariants({ size })}>
      <ModalHeader>
        <div className="flex min-w-0 flex-col gap-1">
          <ModalTitle>{title}</ModalTitle>
          {description ? <ModalDescription>{description}</ModalDescription> : null}
        </div>
        <IconButton
          data-slot="modal-close"
          variant="text"
          size="compact"
          aria-label="Закрыть"
          icon={<Icon icon={Cancel01Icon} />}
        />
      </ModalHeader>
      <Divider />
      <ModalBody>{children}</ModalBody>
      <Divider />
      <ModalFooter>{footer}</ModalFooter>
    </div>
  );
}

function SettingRow({ label, hint }: { label: string; hint: string }) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex min-w-0 flex-col gap-1">
        <label htmlFor={id} className="text-ui-md text-text-1">
          {label}
        </label>
        <span className="text-caption-sm text-text-2">{hint}</span>
      </span>
      <Switch id={id} />
    </div>
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoGrid>
      <DemoRow label="size=sm · 460 · заголовок, разделители, тело, футер Secondary + Primary">
        <StaticModal
          title="Новая доска"
          description="Доска появится в текущем проекте."
          footer={
            <>
              <Button variant="secondary">Отмена</Button>
              <Button variant="primary">Создать</Button>
            </>
          }
        >
          <SettingRow label="Приватная доска" hint="Видна только приглашённым." />
          <SettingRow label="Уведомлять о переносах" hint="Письмо при смене стадии." />
        </StaticModal>
      </DemoRow>

      <DemoRow label="kind=destructive · футер с Danger">
        <StaticModal
          title="Удалить доску"
          description="Двенадцать задач уедут в архив вместе с ней."
          footer={
            <>
              <Button variant="secondary">Отмена</Button>
              <Button variant="danger">Удалить</Button>
            </>
          }
        >
          <p className="text-body-md text-text-body">
            Восстановить доску сможет только администратор пространства, и только в течение
            тридцати дней.
          </p>
        </StaticModal>
      </DemoRow>

      <DemoRow label="size=md · 560 · длинное тело, скроллится только оно">
        {/* A stage with a height, so `max-h-full` of the surface has something
            to measure against — in the app that job belongs to the window. */}
        <div className="flex h-notif-drawer-h w-full items-center justify-start overflow-hidden">
          <StaticModal
            size="md"
            title="Настройки уведомлений"
            footer={
              <>
                <Button variant="secondary">Отмена</Button>
                <Button variant="primary">Сохранить</Button>
              </>
            }
          >
            {Array.from({ length: 8 }, (_, index) => (
              <SettingRow
                key={index}
                label={`Правило ${index + 1}`}
                hint="Письмо приходит сразу, дайджест — раз в сутки."
              />
            ))}
          </StaticModal>
        </div>
      </DemoRow>

      <DemoRow label="Состояние «после действия» — модалка закрылась, снекбар подтвердил">
        <Snackbar
          kind="undo"
          message="Доска «Найм» создана"
          actionLabel="Отменить"
          closeLabel="Закрыть"
        />
      </DemoRow>

      <DemoRow label="Живой пример — фокус-ловушка, Esc, клик по скриму, возврат фокуса">
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Новая доска"
          description="Доска появится в текущем проекте."
          closeLabel="Закрыть"
          trigger={<ModalTrigger render={<Button variant="primary">Открыть модалку</Button>} />}
          footer={
            <>
              <ModalClose render={<Button variant="secondary">Отмена</Button>} />
              <ModalClose render={<Button variant="primary">Создать</Button>} />
            </>
          }
        >
          <SettingRow label="Приватная доска" hint="Видна только приглашённым." />
        </Modal>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "modal";
export const title = "Modal — модалка";
export const component = ModalDemo;
