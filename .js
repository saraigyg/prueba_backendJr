/**Examen de logica
*/

/***2. Programa que toma como parámetro un número entero y regresa una lista (array) con
todos los factores primos del número pasado como argumento. */

function primeFactors (int) {
    function isPrime(int) {
        for (let i = 2; i <=Math.sqrt(int); i++) {
            if (int % i ===0)
                return false;
        }
        return true; 
    } 
    let arrPrime_factors = [];
    for (let i = 2; i <= int; i++)
    {
      while (isPrime(i) && int % i === 0) 
      {
        if (!arrPrime_factors.includes(i)) arrPrime_factors.push(i);
        int /= i;
      }
    }
    return arrPrime_factors;
}

console.log(primeFactors(100));

