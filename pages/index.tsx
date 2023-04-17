import Head from "next/head";
import { useRef, useState } from "react";
import styles from "@/styles/index.module.css";

interface Jugs {
  x: number;
  y: number;
  explanation: string;
}

export default function Home() {
  const [path, setPath] = useState<Jugs[]>([]);
  const [error, setError] = useState<string>("");

  const bucketX = useRef<HTMLInputElement>(null);
  const bucketY = useRef<HTMLInputElement>(null);
  const wanted = useRef<HTMLInputElement>(null);

  // Utility function to return GCD of 'a' and 'b'.
  const gcd = (a: number, b: number): number => {
    if (b == 0) return a;
    return gcd(b, a % b);
  };

  const pour = (max_x: number, max_y: number, z: number) => {
    // Initialize current amount of water in source and destination jugs
    const path: Jugs[] = [];
    let x = max_x;
    let y = 0;

    // Initialize count of steps required
    path.push({
      x,
      y,
      explanation: "Fill bucket x",
    });

    // Break the loop when either of the two jugs has z litre water
    while (x != z && y != z) {
      // Find the maximum amount that can be poured
      const temp = Math.min(x, max_y - y);

      // Pour "temp" liters from "x" to "y"
      y += temp;
      x -= temp;

      // Increment count of steps
      path.push({
        x,
        y,
        explanation: "Transfer bucket x to bucket y",
      });

      if (x == z || y == z) break;

      // If first jug becomes empty, fill it
      if (x == 0) {
        x = max_x;
        path.push({
          x,
          y,
          explanation: "Fill bucket x",
        });
      }

      // If second jug becomes full, empty it
      if (y == max_y) {
        y = 0;
        path.push({
          x,
          y,
          explanation: "Dump bucket y",
        });
      }
    }
    return path;
  };

  // Returns count of minimum steps needed to measure z liter
  const minSteps = (y: number, x: number, z: number) => {
    // To make sure that y is smaller than x
    if (y > x) {
      const t = y;
      y = x;
      x = t;
    }

    // For z > x we cant measure the water
    // using the jugs
    if (z > x) {
      setError("No solution");
      return -1;
    }

    // If gcd of x and y does not divide z then solution is not possible
    if (z % gcd(x, y) != 0) {
      setError("No solution");
      return -1;
    }
    setError("");

    // Return minimum two cases:
    // a) Water of x liter jug is poured into y liter jug
    // b) Vice versa of "a"
    const xToY = pour(x, y, z);
    const yToX = pour(y, x, z);
    setPath(xToY.length > yToX.length ? yToX : xToY);
    return Math.min(
      xToY.length, // x to y
      yToX.length // y to x
    );
  };

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    // Making sure refs are set
    if (!bucketX.current) throw new Error("bucketX is not assigned");
    if (!bucketY.current) throw new Error("bucketY is not assigned");
    if (!wanted.current) throw new Error("wanted is not assigned");
    event.preventDefault();

    setPath([]);

    const x = Math.floor(+bucketX.current.value);
    const y = Math.floor(+bucketY.current.value);
    const z = Math.floor(+wanted.current.value);

    // If values are negative or 0, display error
    if (x < 1 || y < 1 || z < 1) {
      return setError("Please fill all the inputs");
    }

    // If Z is bigger than X oy Y, display error
    if (z > y && z > x) {
      return setError(`The amount wanted can't be bigger than the buckets`);
    }
    setError("");

    minSteps(y, x, z);
  };

  return (
    <>
      <Head>
        <title>Water jug challenge</title>
        <meta name="description" content="Water jug challenge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <form onSubmit={submitHandler}>
          {/* <div>
            <input type="number" ref={bucketX} />
          </div>
          <div>
            <input type="number" ref={bucketY} />
          </div>
          <div>
            <input type="number" ref={wanted} />
          </div> */}

          <div className={`${styles.container}`}>
            <div className={`${styles.jug_container}`}>
              <label htmlFor="">Bucket X</label>
              <div
                className={`${styles.jug}`}
                style={{
                  background: `linear-gradient(0deg, rgba(14,0,249,1) 0%, rgba(254,254,255,1) 100%)`,
                }}
              >
                <input
                  className={`${styles.input}`}
                  type="number"
                  placeholder="0"
                  ref={bucketX}
                />
              </div>
            </div>
            <div className={`${styles.jug_container}`}>
              <label htmlFor="">Bucket Y</label>
              <div
                className={`${styles.jug}`}
                style={{
                  background: `linear-gradient(0deg, rgba(14,0,249,1) 0%, rgba(254,254,255,1) 100%)`,
                }}
              >
                <input
                  className={`${styles.input}`}
                  type="number"
                  placeholder="0"
                  ref={bucketY}
                />
              </div>
            </div>
            <div className={`${styles.jug_container}`}>
              <label htmlFor="">Amount wanted Z</label>
              <div
                className={`${styles.jug}`}
                style={{
                  background: `linear-gradient(0deg, rgba(14,0,249,1) 0%, rgba(254,254,255,1) 100%)`,
                }}
              >
                <input
                  className={`${styles.input}`}
                  type="number"
                  placeholder="0"
                  ref={wanted}
                />
              </div>
            </div>
          </div>

          <div className={`${styles.submit}`}>
            <button>submit</button>
          </div>
          {error && <div className={`${styles.error}`}>{error}</div>}
        </form>

        {path.length > 0 && (
          <>
            <div className={`${styles.result}`}>
              <h4>Solution</h4>
              <table>
                <thead>
                  <tr>
                    <th>Bucket X</th>
                    <th>Bucket Y</th>
                    <th>Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {path.map((value, index) => (
                    <tr key={index}>
                      <td>{value.x}</td>
                      <td>{value.y}</td>
                      <td>
                        {value.explanation}
                        {index + 1 === path.length && (
                          <>
                            <br />
                            <strong>Solved</strong>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  );
}
