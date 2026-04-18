import { INDIVIDUAL_AUDIENCES } from "../types";

export function useAudienceToggle(
  current: string[],
  onChange: (audiences: string[]) => void,
) {
  const isAll = current.includes("all");

  const toggleAll = (checked: boolean) => {
    onChange(checked ? ["all"] : []);
  };

  const toggleIndividual = (option: string, checked: boolean) => {
    if (checked) {
      const withoutAll = current.filter((a) => a !== "all");
      const next = [...withoutAll, option];
      if (INDIVIDUAL_AUDIENCES.every((a) => next.includes(a))) {
        onChange(["all"]);
      } else {
        onChange(next);
      }
    } else {
      if (isAll) {
        onChange(INDIVIDUAL_AUDIENCES.filter((a) => a !== option));
      } else {
        onChange(current.filter((a) => a !== option));
      }
    }
  };

  return { isAll, toggleAll, toggleIndividual };
}
