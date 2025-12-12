import { colors } from "@/theme/colors";

export const darkTheme = {
  mode: "dark" as const,
  colors,
  components: {
    headerLogoutButton: {
      bg: colors.red,
      bgHover: "#D5181F",
      textColor: colors.white,
    },
  },
};
