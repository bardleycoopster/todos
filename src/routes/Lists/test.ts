import produce from "immer";

interface IVal {
  a: string;
  b: number;
}

function myFunc() {
  const val: IVal = {
    a: "test",
    b: 5,
  };

  const newVal = produce(val, (draft) => {
    draft.a = "other";
  });

  console.log(val, newVal);
}
