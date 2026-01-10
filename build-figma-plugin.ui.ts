export default function (buildOptions: any) {
  return {
    ...buildOptions,
    define: {
      global: "window",
    },
  };
}
