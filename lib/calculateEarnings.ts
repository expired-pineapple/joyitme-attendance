function calculateEarnings(formula: string, totalWorkedHours: number) {
    try {
      const result = eval(
        formula.replace("A", totalWorkedHours.toString())
      );
      return result;
    } catch (error) {
      console.error('Error evaluating formula:', error);
      throw error;
    }
  }

  
export { calculateEarnings };
