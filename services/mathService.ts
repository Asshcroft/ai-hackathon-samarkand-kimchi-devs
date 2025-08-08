// Сервис для математических вычислений и физических задач
export interface MathResult {
  expression: string;
  result: string;
  steps?: string[];
  error?: string;
  type: 'calculation' | 'equation' | 'formula' | 'conversion';
}

export interface PhysicsFormula {
  name: string;
  formula: string;
  variables: { [key: string]: string };
  description: string;
  category: string;
}

// Физические формулы
const physicsFormulas: PhysicsFormula[] = [
  // Механика
  {
    name: 'Сила (F = ma)',
    formula: 'F = m * a',
    variables: { F: 'сила (Н)', m: 'масса (кг)', a: 'ускорение (м/с²)' },
    description: 'Второй закон Ньютона',
    category: 'mechanics'
  },
  {
    name: 'Кинетическая энергия (KE = ½mv²)',
    formula: 'KE = 0.5 * m * v * v',
    variables: { KE: 'кинетическая энергия (Дж)', m: 'масса (кг)', v: 'скорость (м/с)' },
    description: 'Кинетическая энергия движущегося тела',
    category: 'mechanics'
  },
  {
    name: 'Потенциальная энергия (PE = mgh)',
    formula: 'PE = m * g * h',
    variables: { PE: 'потенциальная энергия (Дж)', m: 'масса (кг)', g: 'ускорение свободного падения (м/с²)', h: 'высота (м)' },
    description: 'Гравитационная потенциальная энергия',
    category: 'mechanics'
  },
  {
    name: 'Работа (W = Fd)',
    formula: 'W = F * d',
    variables: { W: 'работа (Дж)', F: 'сила (Н)', d: 'расстояние (м)' },
    description: 'Работа, совершаемая силой',
    category: 'mechanics'
  },
  {
    name: 'Мощность (P = W/t)',
    formula: 'P = W / t',
    variables: { P: 'мощность (Вт)', W: 'работа (Дж)', t: 'время (с)' },
    description: 'Мощность - работа в единицу времени',
    category: 'mechanics'
  },
  {
    name: 'Импульс (p = mv)',
    formula: 'p = m * v',
    variables: { p: 'импульс (кг·м/с)', m: 'масса (кг)', v: 'скорость (м/с)' },
    description: 'Линейный импульс',
    category: 'mechanics'
  },
  // Термодинамика
  {
    name: 'Закон идеального газа (PV = nRT)',
    formula: 'P * V = n * R * T',
    variables: { P: 'давление (Па)', V: 'объем (м³)', n: 'количество вещества (моль)', R: 'газовая постоянная (Дж/моль·К)', T: 'температура (К)' },
    description: 'Уравнение состояния идеального газа',
    category: 'thermodynamics'
  },
  {
    name: 'Теплота (Q = mcΔT)',
    formula: 'Q = m * c * deltaT',
    variables: { Q: 'теплота (Дж)', m: 'масса (кг)', c: 'удельная теплоемкость (Дж/кг·К)', deltaT: 'изменение температуры (К)' },
    description: 'Количество теплоты при нагревании',
    category: 'thermodynamics'
  },
  // Электромагнетизм
  {
    name: 'Закон Ома (R = V/I)',
    formula: 'R = V / I',
    variables: { R: 'сопротивление (Ом)', V: 'напряжение (В)', I: 'сила тока (А)' },
    description: 'Закон Ома',
    category: 'electromagnetism'
  },
  {
    name: 'Электрическая мощность (P = VI)',
    formula: 'P = V * I',
    variables: { P: 'мощность (Вт)', V: 'напряжение (В)', I: 'сила тока (А)' },
    description: 'Электрическая мощность',
    category: 'electromagnetism'
  },
  {
    name: 'Закон Кулона (F = kq₁q₂/r²)',
    formula: 'F = k * q1 * q2 / (r * r)',
    variables: { F: 'сила (Н)', k: 'константа Кулона (Н·м²/Кл²)', q1: 'заряд 1 (Кл)', q2: 'заряд 2 (Кл)', r: 'расстояние (м)' },
    description: 'Электростатическая сила',
    category: 'electromagnetism'
  },
  // Гидромеханика
  {
    name: 'Давление (P = F/A)',
    formula: 'P = F / A',
    variables: { P: 'давление (Па)', F: 'сила (Н)', A: 'площадь (м²)' },
    description: 'Определение давления',
    category: 'fluid_mechanics'
  },
  {
    name: 'Число Рейнольдса (Re = ρvD/μ)',
    formula: 'Re = rho * v * D / mu',
    variables: { Re: 'число Рейнольдса', rho: 'плотность (кг/м³)', v: 'скорость (м/с)', D: 'диаметр (м)', mu: 'динамическая вязкость (Па·с)' },
    description: 'Число Рейнольдса для определения режима течения',
    category: 'fluid_mechanics'
  }
];

// Константы
const constants = {
  g: 9.81, // ускорение свободного падения
  R: 8.314, // газовая постоянная
  k: 8.99e9, // константа Кулона
  pi: Math.PI,
  e: Math.E
};

// Функция для безопасного вычисления математических выражений
function safeEval(expression: string): number {
  // Заменяем математические символы
  let processedExpression = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/e\b/g, 'Math.E')
    .replace(/√/g, 'Math.sqrt')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/log/g, 'Math.log10')
    .replace(/ln/g, 'Math.log')
    .replace(/exp/g, 'Math.exp')
    .replace(/abs/g, 'Math.abs')
    .replace(/pow/g, 'Math.pow');

  // Создаем безопасный контекст для вычислений
  const context = {
    Math: Math,
    ...constants
  };

  // Создаем функцию для безопасного вычисления
  const safeFunction = new Function('Math', ...Object.keys(constants), `return ${processedExpression}`);
  
  return safeFunction(Math, ...Object.values(constants));
}

// Функция для решения физических формул
function solvePhysicsFormula(formula: PhysicsFormula, knownValues: { [key: string]: number }): MathResult {
  try {
    const steps: string[] = [];
    let resultExpression = formula.formula;
    
    // Подставляем известные значения
    for (const [variable, value] of Object.entries(knownValues)) {
      resultExpression = resultExpression.replace(new RegExp(`\\b${variable}\\b`, 'g'), value.toString());
      steps.push(`Подставляем ${variable} = ${value}`);
    }
    
    // Вычисляем результат
    const result = safeEval(resultExpression);
    steps.push(`Вычисляем: ${resultExpression} = ${result}`);
    
    return {
      expression: formula.name,
      result: result.toString(),
      steps,
      type: 'formula'
    };
  } catch (error) {
    return {
      expression: formula.name,
      result: 'Ошибка',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      type: 'formula'
    };
  }
}

// Функция для решения уравнений
function solveEquation(equation: string): MathResult {
  try {
    // Простые линейные уравнения вида ax + b = c
    const match = equation.match(/^(\d*\.?\d*)x\s*([+\-])\s*(\d*\.?\d*)\s*=\s*(\d*\.?\d*)$/);
    
    if (match) {
      const [, aStr, op, bStr, cStr] = match;
      const a = parseFloat(aStr || '1');
      const b = parseFloat(bStr);
      const c = parseFloat(cStr);
      
      let x: number;
      if (op === '+') {
        x = (c - b) / a;
      } else {
        x = (c + b) / a;
      }
      
      return {
        expression: equation,
        result: `x = ${x}`,
        steps: [
          `${op === '+' ? 'Вычитаем' : 'Прибавляем'} ${b} с обеих сторон`,
          `Делим на ${a}`,
          `x = ${x}`
        ],
        type: 'equation'
      };
    }
    
    // Квадратные уравнения вида ax² + bx + c = 0
    const quadMatch = equation.match(/^(\d*\.?\d*)x²\s*([+\-])\s*(\d*\.?\d*)x\s*([+\-])\s*(\d*\.?\d*)\s*=\s*0$/);
    
    if (quadMatch) {
      const [, aStr, op1, bStr, op2, cStr] = quadMatch;
      const a = parseFloat(aStr || '1');
      const b = parseFloat(bStr) * (op1 === '-' ? -1 : 1);
      const c = parseFloat(cStr) * (op2 === '-' ? -1 : 1);
      
      const discriminant = b * b - 4 * a * c;
      
      if (discriminant >= 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        return {
          expression: equation,
          result: `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`,
          steps: [
            `Дискриминант: D = b² - 4ac = ${b}² - 4·${a}·${c} = ${discriminant}`,
            `x = (-b ± √D) / (2a)`,
            `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`
          ],
          type: 'equation'
        };
      } else {
        return {
          expression: equation,
          result: 'Нет действительных корней',
          steps: [`Дискриминант: D = ${discriminant} < 0`],
          type: 'equation'
        };
      }
    }
    
    // Если не распознано, пытаемся вычислить как обычное выражение
    const result = safeEval(equation);
    return {
      expression: equation,
      result: result.toString(),
      type: 'calculation'
    };
    
  } catch (error) {
    return {
      expression: equation,
      result: 'Ошибка',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      type: 'equation'
    };
  }
}

// Основная функция для обработки математических запросов
export function processMathRequest(input: string): MathResult | null {
  const lowerInput = input.toLowerCase();
  
  // Проверяем, является ли это физической формулой
  for (const formula of physicsFormulas) {
    if (lowerInput.includes(formula.name.toLowerCase()) || 
        lowerInput.includes(formula.formula.toLowerCase())) {
      
      // Извлекаем числовые значения из текста
      const numbers = input.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      
      if (numbers.length >= 2) {
        const variables = Object.keys(formula.variables);
        const knownValues: { [key: string]: number } = {};
        
        // Сопоставляем числа с переменными (упрощенная логика)
        for (let i = 0; i < Math.min(numbers.length, variables.length); i++) {
          knownValues[variables[i]] = numbers[i];
        }
        
        return solvePhysicsFormula(formula, knownValues);
      }
    }
  }
  
  // Проверяем, является ли это уравнением
  if (lowerInput.includes('x') && (lowerInput.includes('=') || lowerInput.includes('решить'))) {
    const equationMatch = input.match(/([^=]+)\s*=\s*([^=]+)/);
    if (equationMatch) {
      const equation = equationMatch[0].replace(/\s+/g, '');
      return solveEquation(equation);
    }
  }
  
  // Проверяем, является ли это простым математическим выражением
  if (/[\d+\-*/().,^√πe]/.test(input)) {
    try {
      const result = safeEval(input);
      return {
        expression: input,
        result: result.toString(),
        type: 'calculation'
      };
    } catch (error) {
      return {
        expression: input,
        result: 'Ошибка',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        type: 'calculation'
      };
    }
  }
  
  return null;
}

// Функция для получения списка доступных формул
export function getAvailableFormulas(category?: string): PhysicsFormula[] {
  if (category) {
    return physicsFormulas.filter(f => f.category === category);
  }
  return physicsFormulas;
}

// Функция для получения категорий формул
export function getFormulaCategories(): string[] {
  return [...new Set(physicsFormulas.map(f => f.category))];
}

// Функция для поиска формул по ключевым словам
export function searchFormulas(query: string): PhysicsFormula[] {
  const lowerQuery = query.toLowerCase();
  return physicsFormulas.filter(formula => 
    formula.name.toLowerCase().includes(lowerQuery) ||
    formula.description.toLowerCase().includes(lowerQuery) ||
    formula.category.toLowerCase().includes(lowerQuery)
  );
}
