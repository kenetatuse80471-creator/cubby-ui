import { Button } from "@/registry/cubby/ui/button";
import { Snackbar, SnackbarProvider, useSnackbar } from "@/registry/cubby/ui/snackbar";
import { DemoGrid, DemoRow } from "@/registry/cubby/demos/demo";

/**
 * The live viewport is fixed to the bottom left of the window, outside the
 * section a screenshot is taken of — so the three kinds below are the same
 * `Snackbar` rendered without a toast object, which is exactly what it is
 * built to do. The buttons at the bottom drive the real queue.
 */
function LiveSnackbars() {
  const { notify } = useSnackbar();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          notify({
            kind: "undo",
            message: "Задача перенесена в «Готово»",
            actionLabel: "Отменить",
            onAction: () => {},
            closeLabel: "Закрыть",
          })
        }
      >
        Undo · 5 с
      </Button>
      <Button
        variant="secondary"
        onClick={() => notify({ kind: "quiet", message: "Настройка сохранена" })}
      >
        Quiet · 3 с
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          notify({
            kind: "error",
            message: "Не удалось сохранить изменения",
            actionLabel: "Повторить",
            onAction: () => {},
            closeLabel: "Закрыть",
          })
        }
      >
        Error · до закрытия
      </Button>
    </div>
  );
}

function SnackbarDemo() {
  return (
    <DemoGrid>
      <DemoRow label="undo · 5 секунд, пауза на наведении · 44 высотой, плашка plate, тень overlay">
        <Snackbar
          kind="undo"
          message="Задача перенесена в «Готово»"
          actionLabel="Отменить"
          closeLabel="Закрыть"
        />
      </DemoRow>

      <DemoRow label="quiet · 3 секунды, без действия и без крестика">
        <Snackbar kind="quiet" message="Настройка сохранена" />
      </DemoRow>

      <DemoRow label="error · полоска 3px слева, живёт до закрытия вручную">
        <Snackbar
          kind="error"
          message="Не удалось сохранить изменения"
          actionLabel="Повторить"
          closeLabel="Закрыть"
        />
      </DemoRow>

      <DemoRow label="Состояние «после действия» — действие сделано, отмена под рукой">
        <div className="flex flex-col gap-2">
          <span className="text-caption-sm text-text-2">
            Задача отмечена выполненной — строка уже перечёркнута, снекбар держит отмену
            пять секунд.
          </span>
          <Snackbar
            kind="undo"
            message="«Собрать отчёт» выполнена"
            actionLabel="Отменить"
            closeLabel="Закрыть"
          />
        </div>
      </DemoRow>

      <DemoRow label="Живые — один за раз, новый вытесняет предыдущий, снизу слева">
        <SnackbarProvider>
          <LiveSnackbars />
        </SnackbarProvider>
      </DemoRow>
    </DemoGrid>
  );
}

export const name = "snackbar";
export const title = "Snackbar — снекбар";
export const component = SnackbarDemo;
