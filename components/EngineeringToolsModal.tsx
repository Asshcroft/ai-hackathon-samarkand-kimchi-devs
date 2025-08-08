import React, { useState, useEffect } from 'react';
import { soundService } from '../services/ttsService';
import { getAvailableFormulas, getFormulaCategories, searchFormulas, processMathRequest } from '../services/mathService';

interface EngineeringToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CalculationResult {
  expression: string;
  result: string;
  error?: string;
}

interface UnitConversion {
  from: string;
  to: string;
  value: number;
  result: number;
}

const EngineeringToolsModal: React.FC<EngineeringToolsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'converter' | 'formulas' | 'constants' | 'physics'>('calculator');
  const [expression, setExpression] = useState('');
  const [calculationHistory, setCalculationHistory] = useState<CalculationResult[]>([]);
  const [conversionType, setConversionType] = useState<'length' | 'area' | 'volume' | 'weight' | 'temperature' | 'pressure' | 'energy' | 'power'>('length');
  const [conversionValue, setConversionValue] = useState('');
  const [conversionFrom, setConversionFrom] = useState('');
  const [conversionTo, setConversionTo] = useState('');
  const [conversionResult, setConversionResult] = useState<UnitConversion | null>(null);
  const [physicsExpression, setPhysicsExpression] = useState('');
  const [selectedPhysicsCategory, setSelectedPhysicsCategory] = useState<string>('');
  const [physicsResult, setPhysicsResult] = useState<any>(null);

  // Conversion units
  const conversionUnits = {
    length: {
      units: ['meters', 'kilometers', 'centimeters', 'millimeters', 'inches', 'feet', 'yards', 'miles'],
      conversions: {
        meters: 1,
        kilometers: 1000,
        centimeters: 0.01,
        millimeters: 0.001,
        inches: 0.0254,
        feet: 0.3048,
        yards: 0.9144,
        miles: 1609.344
      }
    },
    area: {
      units: ['square_meters', 'square_kilometers', 'square_centimeters', 'square_inches', 'square_feet', 'square_yards', 'acres', 'hectares'],
      conversions: {
        square_meters: 1,
        square_kilometers: 1000000,
        square_centimeters: 0.0001,
        square_inches: 0.00064516,
        square_feet: 0.092903,
        square_yards: 0.836127,
        acres: 4046.86,
        hectares: 10000
      }
    },
    volume: {
      units: ['cubic_meters', 'liters', 'milliliters', 'cubic_inches', 'cubic_feet', 'gallons', 'cubic_yards'],
      conversions: {
        cubic_meters: 1,
        liters: 0.001,
        milliliters: 0.000001,
        cubic_inches: 0.000016387,
        cubic_feet: 0.0283168,
        gallons: 0.00378541,
        cubic_yards: 0.764555
      }
    },
    weight: {
      units: ['kilograms', 'grams', 'milligrams', 'pounds', 'ounces', 'tons'],
      conversions: {
        kilograms: 1,
        grams: 0.001,
        milligrams: 0.000001,
        pounds: 0.453592,
        ounces: 0.0283495,
        tons: 907.185
      }
    },
    temperature: {
      units: ['celsius', 'fahrenheit', 'kelvin'],
      conversions: {
        celsius: 'celsius',
        fahrenheit: 'fahrenheit',
        kelvin: 'kelvin'
      }
    },
    pressure: {
      units: ['pascals', 'kilopascals', 'megapascals', 'bars', 'psi', 'atmospheres'],
      conversions: {
        pascals: 1,
        kilopascals: 1000,
        megapascals: 1000000,
        bars: 100000,
        psi: 6894.76,
        atmospheres: 101325
      }
    },
    energy: {
      units: ['joules', 'kilojoules', 'calories', 'kilocalories', 'electronvolts', 'british_thermal_units'],
      conversions: {
        joules: 1,
        kilojoules: 1000,
        calories: 4.184,
        kilocalories: 4184,
        electronvolts: 1.60218e-19,
        british_thermal_units: 1055.06
      }
    },
    power: {
      units: ['watts', 'kilowatts', 'megawatts', 'horsepower', 'btu_per_hour'],
      conversions: {
        watts: 1,
        kilowatts: 1000,
        megawatts: 1000000,
        horsepower: 745.7,
        btu_per_hour: 0.293071
      }
    }
  };

  // Engineering constants
  const engineeringConstants = [
    { name: 'Gravitational Constant (G)', value: '6.67430 × 10⁻¹¹ N⋅m²/kg²', description: 'Universal gravitational constant' },
    { name: 'Speed of Light (c)', value: '299,792,458 m/s', description: 'Speed of light in vacuum' },
    { name: 'Planck Constant (h)', value: '6.62607015 × 10⁻³⁴ J⋅s', description: 'Planck constant' },
    { name: 'Boltzmann Constant (k)', value: '1.380649 × 10⁻²³ J/K', description: 'Boltzmann constant' },
    { name: 'Avogadro Number (Nₐ)', value: '6.02214076 × 10²³ mol⁻¹', description: 'Avogadro constant' },
    { name: 'Elementary Charge (e)', value: '1.602176634 × 10⁻¹⁹ C', description: 'Elementary charge' },
    { name: 'Electron Mass (mₑ)', value: '9.1093837015 × 10⁻³¹ kg', description: 'Electron rest mass' },
    { name: 'Proton Mass (mₚ)', value: '1.67262192369 × 10⁻²⁷ kg', description: 'Proton rest mass' },
    { name: 'Neutron Mass (mₙ)', value: '1.67492749804 × 10⁻²⁷ kg', description: 'Neutron rest mass' },
    { name: 'Fine Structure Constant (α)', value: '7.2973525693 × 10⁻³', description: 'Fine structure constant' },
    { name: 'Rydberg Constant (R∞)', value: '1.0973731568160 × 10⁷ m⁻¹', description: 'Rydberg constant' },
    { name: 'Stefan-Boltzmann Constant (σ)', value: '5.670374419 × 10⁻⁸ W⋅m⁻²⋅K⁻⁴', description: 'Stefan-Boltzmann constant' },
    { name: 'Gas Constant (R)', value: '8.314462618 J⋅mol⁻¹⋅K⁻¹', description: 'Universal gas constant' },
    { name: 'Vacuum Permittivity (ε₀)', value: '8.8541878128 × 10⁻¹² F/m', description: 'Vacuum permittivity' },
    { name: 'Vacuum Permeability (μ₀)', value: '1.25663706212 × 10⁻⁶ H/m', description: 'Vacuum permeability' },
    { name: 'Impedance of Free Space (Z₀)', value: '376.730313668 Ω', description: 'Characteristic impedance of vacuum' },
    { name: 'Golden Ratio (φ)', value: '1.618033988749895', description: 'Golden ratio' },
    { name: 'Euler\'s Number (e)', value: '2.718281828459045', description: 'Natural logarithm base' },
    { name: 'Pi (π)', value: '3.141592653589793', description: 'Ratio of circumference to diameter' },
    { name: 'Euler-Mascheroni Constant (γ)', value: '0.5772156649015329', description: 'Euler-Mascheroni constant' }
  ];

  // Common engineering formulas
  const engineeringFormulas = [
    {
      category: 'Mechanics',
      formulas: [
        { name: 'Force (F = ma)', formula: 'F = m × a', description: 'Newton\'s second law' },
        { name: 'Kinetic Energy (KE = ½mv²)', formula: 'KE = ½ × m × v²', description: 'Kinetic energy' },
        { name: 'Potential Energy (PE = mgh)', formula: 'PE = m × g × h', description: 'Gravitational potential energy' },
        { name: 'Work (W = Fd)', formula: 'W = F × d', description: 'Work done by force' },
        { name: 'Power (P = W/t)', formula: 'P = W / t', description: 'Power' },
        { name: 'Momentum (p = mv)', formula: 'p = m × v', description: 'Linear momentum' },
        { name: 'Impulse (J = FΔt)', formula: 'J = F × Δt', description: 'Impulse' }
      ]
    },
    {
      category: 'Thermodynamics',
      formulas: [
        { name: 'Ideal Gas Law (PV = nRT)', formula: 'P × V = n × R × T', description: 'Ideal gas law' },
        { name: 'Heat (Q = mcΔT)', formula: 'Q = m × c × ΔT', description: 'Heat transfer' },
        { name: 'Efficiency (η = W/Q)', formula: 'η = W / Q', description: 'Thermal efficiency' },
        { name: 'Entropy Change (ΔS = Q/T)', formula: 'ΔS = Q / T', description: 'Entropy change' }
      ]
    },
    {
      category: 'Electromagnetism',
      formulas: [
        { name: 'Coulomb\'s Law (F = kq₁q₂/r²)', formula: 'F = k × q₁ × q₂ / r²', description: 'Electrostatic force' },
        { name: 'Electric Field (E = F/q)', formula: 'E = F / q', description: 'Electric field strength' },
        { name: 'Voltage (V = W/q)', formula: 'V = W / q', description: 'Electric potential' },
        { name: 'Current (I = Q/t)', formula: 'I = Q / t', description: 'Electric current' },
        { name: 'Resistance (R = V/I)', formula: 'R = V / I', description: 'Ohm\'s law' },
        { name: 'Power (P = VI)', formula: 'P = V × I', description: 'Electrical power' },
        { name: 'Magnetic Force (F = qvB)', formula: 'F = q × v × B', description: 'Lorentz force' }
      ]
    },
    {
      category: 'Fluid Mechanics',
      formulas: [
        { name: 'Pressure (P = F/A)', formula: 'P = F / A', description: 'Pressure definition' },
        { name: 'Bernoulli\'s Equation', formula: 'P + ½ρv² + ρgh = constant', description: 'Bernoulli\'s principle' },
        { name: 'Flow Rate (Q = Av)', formula: 'Q = A × v', description: 'Volume flow rate' },
        { name: 'Reynolds Number (Re = ρvD/μ)', formula: 'Re = ρ × v × D / μ', description: 'Reynolds number' }
      ]
    },
    {
      category: 'Materials',
      formulas: [
        { name: 'Stress (σ = F/A)', formula: 'σ = F / A', description: 'Normal stress' },
        { name: 'Strain (ε = ΔL/L)', formula: 'ε = ΔL / L', description: 'Normal strain' },
        { name: 'Young\'s Modulus (E = σ/ε)', formula: 'E = σ / ε', description: 'Elastic modulus' },
        { name: 'Poisson\'s Ratio (ν = -εₜ/εₗ)', formula: 'ν = -εₜ / εₗ', description: 'Poisson\'s ratio' }
      ]
    }
  ];

  const calculateExpression = () => {
    if (!expression.trim()) return;

    try {
      // Replace common mathematical symbols
      let processedExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, Math.PI)
        .replace(/e/g, Math.E)
        .replace(/√/g, 'Math.sqrt')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/exp/g, 'Math.exp')
        .replace(/abs/g, 'Math.abs')
        .replace(/pow/g, 'Math.pow');

      // Evaluate the expression
      const result = eval(processedExpression);
      
      const calculationResult: CalculationResult = {
        expression: expression,
        result: typeof result === 'number' ? result.toString() : result
      };

      setCalculationHistory(prev => [calculationResult, ...prev.slice(0, 9)]);
      setExpression('');
      soundService.playClickSound();
    } catch (error) {
      const errorResult: CalculationResult = {
        expression: expression,
        result: 'Error',
        error: error instanceof Error ? error.message : 'Invalid expression'
      };
      setCalculationHistory(prev => [errorResult, ...prev.slice(0, 9)]);
      soundService.playClickSound();
    }
  };

  const convertUnits = () => {
    if (!conversionValue || !conversionFrom || !conversionTo) return;

    const value = parseFloat(conversionValue);
    if (isNaN(value)) return;

    const units = conversionUnits[conversionType];
    const fromFactor = units.conversions[conversionFrom as keyof typeof units.conversions];
    const toFactor = units.conversions[conversionTo as keyof typeof units.conversions];

    let result: number;

    if (conversionType === 'temperature') {
      // Special handling for temperature conversions
      result = convertTemperature(value, conversionFrom, conversionTo);
    } else {
      // Standard conversion
      const baseValue = value * (fromFactor as number);
      result = baseValue / (toFactor as number);
    }

    const conversion: UnitConversion = {
      from: conversionFrom,
      to: conversionTo,
      value: value,
      result: result
    };

    setConversionResult(conversion);
    soundService.playClickSound();
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // Convert from Celsius to target unit
    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return celsius * 9/5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'calculator') {
        calculateExpression();
      } else if (activeTab === 'converter') {
        convertUnits();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-orange-400 rounded-lg p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-orange-400 text-xl font-bold">ENGINEERING TOOLS</h2>
          <button
            onClick={() => {
              soundService.playClickSound();
              onClose();
            }}
            onMouseEnter={() => soundService.playHoverSound()}
            className="text-orange-400 hover:text-orange-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-4">
          {[
            { id: 'calculator', label: 'Calculator' },
            { id: 'converter', label: 'Unit Converter' },
            { id: 'formulas', label: 'Formulas' },
            { id: 'constants', label: 'Constants' },
            { id: 'physics', label: 'Physics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                soundService.playClickSound();
                setActiveTab(tab.id as any);
              }}
              onMouseEnter={() => soundService.playHoverSound()}
              className={`px-4 py-2 rounded border ${
                activeTab === tab.id
                  ? 'bg-orange-400 text-black border-orange-400'
                  : 'bg-transparent text-orange-400 border-orange-400 hover:bg-orange-400/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter mathematical expression..."
                className="flex-1 bg-transparent border border-orange-400 text-orange-300 p-2 rounded focus:outline-none focus:border-orange-300"
              />
              <button
                onClick={calculateExpression}
                onMouseEnter={() => soundService.playHoverSound()}
                className="px-4 py-2 bg-orange-400 text-black rounded hover:bg-orange-300"
              >
                Calculate
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {['sin', 'cos', 'tan', 'log', 'ln', '√', 'π', 'e', 'abs', 'exp'].map(func => (
                <button
                  key={func}
                  onClick={() => {
                    soundService.playClickSound();
                    setExpression(prev => prev + func + '(');
                  }}
                  onMouseEnter={() => soundService.playHoverSound()}
                  className="p-2 bg-orange-400/20 text-orange-400 border border-orange-400 rounded hover:bg-orange-400/30"
                >
                  {func}
                </button>
              ))}
            </div>

            {calculationHistory.length > 0 && (
              <div className="border border-orange-400 rounded p-4">
                <h3 className="text-orange-400 mb-2">Calculation History:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {calculationHistory.map((calc, index) => (
                    <div key={index} className="text-sm">
                      <div className="text-orange-300">{calc.expression}</div>
                      <div className={`text-orange-400 ${calc.error ? 'text-red-400' : ''}`}>
                        = {calc.error ? calc.error : calc.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unit Converter Tab */}
        {activeTab === 'converter' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-orange-400 mb-2">Conversion Type:</label>
                <select
                  value={conversionType}
                  onChange={(e) => setConversionType(e.target.value as any)}
                  className="w-full bg-transparent border border-orange-400 text-orange-300 p-2 rounded focus:outline-none"
                >
                  {Object.keys(conversionUnits).map(type => (
                    <option key={type} value={type} className="bg-black">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-orange-400 mb-2">Value:</label>
                <input
                  type="number"
                  value={conversionValue}
                  onChange={(e) => setConversionValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-transparent border border-orange-400 text-orange-300 p-2 rounded focus:outline-none"
                  placeholder="Enter value"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-orange-400 mb-2">From:</label>
                <select
                  value={conversionFrom}
                  onChange={(e) => setConversionFrom(e.target.value)}
                  className="w-full bg-transparent border border-orange-400 text-orange-300 p-2 rounded focus:outline-none"
                >
                  <option value="" className="bg-black">Select unit</option>
                  {conversionUnits[conversionType].units.map(unit => (
                    <option key={unit} value={unit} className="bg-black">
                      {unit.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-orange-400 mb-2">To:</label>
                <select
                  value={conversionTo}
                  onChange={(e) => setConversionTo(e.target.value)}
                  className="w-full bg-transparent border border-orange-400 text-orange-300 p-2 rounded focus:outline-none"
                >
                  <option value="" className="bg-black">Select unit</option>
                  {conversionUnits[conversionType].units.map(unit => (
                    <option key={unit} value={unit} className="bg-black">
                      {unit.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={convertUnits}
              onMouseEnter={() => soundService.playHoverSound()}
              className="w-full px-4 py-2 bg-orange-400 text-black rounded hover:bg-orange-300"
            >
              Convert
            </button>

            {conversionResult && (
              <div className="border border-orange-400 rounded p-4 text-center">
                <div className="text-orange-300">
                  {conversionResult.value} {conversionResult.from.replace('_', ' ')}
                </div>
                <div className="text-orange-400 text-xl">
                  = {conversionResult.result.toFixed(6)} {conversionResult.to.replace('_', ' ')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formulas Tab */}
        {activeTab === 'formulas' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {engineeringFormulas.map(category => (
              <div key={category.category} className="border border-orange-400 rounded p-4">
                <h3 className="text-orange-400 text-lg mb-3">{category.category}</h3>
                <div className="grid gap-3">
                  {category.formulas.map(formula => (
                    <div key={formula.name} className="bg-orange-400/10 border border-orange-400/30 rounded p-3">
                      <div className="text-orange-300 font-semibold">{formula.name}</div>
                      <div className="text-orange-400 text-lg my-1">{formula.formula}</div>
                      <div className="text-orange-500 text-sm">{formula.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

                 {/* Constants Tab */}
         {activeTab === 'constants' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
             {engineeringConstants.map(constant => (
               <div key={constant.name} className="border border-orange-400 rounded p-3">
                 <div className="text-orange-300 font-semibold">{constant.name}</div>
                 <div className="text-orange-400 text-lg my-1">{constant.value}</div>
                 <div className="text-orange-500 text-sm">{constant.description}</div>
               </div>
             ))}
           </div>
         )}

         {/* Physics Tab */}
         {activeTab === 'physics' && (
           <div className="space-y-4">
             <div className="flex space-x-2">
               <input
                 type="text"
                 value={physicsExpression}
                 onChange={(e) => setPhysicsExpression(e.target.value)}
                 onKeyPress={(e) => {
                   if (e.key === 'Enter') {
                     const result = processMathRequest(physicsExpression);
                     if (result) {
                       setPhysicsResult(result);
                       soundService.playClickSound();
                     }
                   }
                 }}
                 placeholder="Введите физическую задачу (например: F=ma с m=2, a=3)"
                 className="flex-1 bg-transparent border border-orange-400 text-orange-300 p-2 rounded focus:outline-none focus:border-orange-300"
               />
               <button
                 onClick={() => {
                   const result = processMathRequest(physicsExpression);
                   if (result) {
                     setPhysicsResult(result);
                     soundService.playClickSound();
                   }
                 }}
                 onMouseEnter={() => soundService.playHoverSound()}
                 className="px-4 py-2 bg-orange-400 text-black rounded hover:bg-orange-300"
               >
                 Решить
               </button>
             </div>

             {physicsResult && (
               <div className="border border-orange-400 rounded p-4">
                 <div className="text-orange-300 font-semibold mb-2">Результат:</div>
                 <div className="text-orange-400 mb-2">{physicsResult.expression}</div>
                 <div className="text-orange-400 text-lg mb-2">= {physicsResult.result}</div>
                 
                 {physicsResult.steps && physicsResult.steps.length > 0 && (
                   <div className="mt-3">
                     <div className="text-orange-300 font-semibold mb-2">Пошаговое решение:</div>
                     <div className="space-y-1">
                       {physicsResult.steps.map((step: string, index: number) => (
                         <div key={index} className="text-orange-400 text-sm">
                           {index + 1}. {step}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             )}

             <div className="border border-orange-400 rounded p-4">
               <div className="text-orange-300 font-semibold mb-3">Примеры задач:</div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                 <div className="text-orange-400">• F=ma с m=2, a=3</div>
                 <div className="text-orange-400">• KE=½mv² с m=1, v=5</div>
                 <div className="text-orange-400">• PE=mgh с m=10, h=5</div>
                 <div className="text-orange-400">• W=Fd с F=10, d=3</div>
                 <div className="text-orange-400">• P=VI с V=12, I=2</div>
                 <div className="text-orange-400">• R=V/I с V=24, I=3</div>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default EngineeringToolsModal;
