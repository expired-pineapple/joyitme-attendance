const validateFormula = (formula: string) => {
    try {
      const result = eval(
        formula.replace("A", "10")
      );

      return true;
    } catch (error) {
      return false;
    }
  };


export default validateFormula;
