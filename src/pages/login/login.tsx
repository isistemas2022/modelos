import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* CONTADOR OTP */
  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((time) => time - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const enviarOTP = () => {
    if (!email.trim()) {
      setMessage("Ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    setMessage("");

    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setTimeLeft(60);
      setOtp(["", "", "", "", ""]);
      setMessage("Hemos enviado un código OTP a tu correo.");

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (timeLeft <= 0) return;

    if (!/^\d?$/.test(value)) return;

    const nuevoOtp = [...otp];
    nuevoOtp[index] = value;

    setOtp(nuevoOtp);
    setMessage("");

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verificarOTP = () => {
    const codigo = otp.join("");

    if (timeLeft <= 0) {
      setMessage(
        "El código ha expirado. Solicita uno nuevo."
      );
      return;
    }

    if (codigo.length !== 5) {
      setMessage("Ingresa los 5 dígitos del código.");
      return;
    }

    setLoading(true);
    setMessage("");

    setTimeout(() => {
      setLoading(false);

      if (codigo === "12345") {
        navigate("/dashboard");
      } else {
        setMessage("El código OTP es incorrecto.");
      }
    }, 1000);
  };

  const reenviarOTP = () => {
    setLoading(true);
    setMessage("");

    setTimeout(() => {
      setLoading(false);

      setOtp(["", "", "", "", ""]);
      setTimeLeft(60);

      setMessage(
        "Se ha enviado un nuevo código OTP."
      );

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 1000);
  };

  const volver = () => {
    setStep("email");
    setOtp(["", "", "", "", ""]);
    setTimeLeft(60);
    setMessage("");
  };

  const minutos = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");

  const segundos = (timeLeft % 60)
    .toString()
    .padStart(2, "0");

  const porcentaje = (timeLeft / 60) * 100;

  return (
    <main className="login-page">

      <section className="login-card">

        {/* LOGO */}

        <div className="login-brand">

          <div className="brand-icon">
            BD
          </div>

          <h1>
            <span>Big</span>Data
          </h1>

          <p>
            Plataforma de análisis de datos
          </p>

        </div>

        {/* EMAIL */}

        {step === "email" ? (

          <div className="login-form">

            <div className="login-title">

              <h2>Bienvenido</h2>

              <p>
                Ingresa tu correo electrónico
                para continuar
              </p>

            </div>

            <label>
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <button
              className="login-button"
              onClick={enviarOTP}
              disabled={loading}
            >
              {loading
                ? "Enviando..."
                : "Enviar código OTP"}
            </button>

            {message && (
              <div className="login-message">
                {message}
              </div>
            )}

            <button
              className="back-button"
              onClick={() => navigate("/")}
            >
              ← Volver al inicio
            </button>

          </div>

        ) : (

          /* OTP */

          <div className="login-form">

            <div className="login-title">

              <h2>Verificación</h2>

              <p>
                Ingresa el código de 5 dígitos
                enviado a:
              </p>

              <strong>
                {email}
              </strong>

            </div>

            {/* CONTADOR */}

            <div
              className={`otp-timer ${
                timeLeft <= 10
                  ? "timer-warning"
                  : ""
              } ${
                timeLeft === 0
                  ? "timer-expired"
                  : ""
              }`}
            >

              <div className="timer-icon">
                ⏱
              </div>

              <div className="timer-info">

                <span>
                  {timeLeft === 0
                    ? "Código expirado"
                    : "El código expira en"}
                </span>

                <strong>
                  {timeLeft > 0
                    ? `${minutos}:${segundos}`
                    : "00:00"}
                </strong>

              </div>

            </div>

            {/* BARRA */}

            <div className="timer-progress">

              <div
                className="timer-progress-bar"
                style={{
                  width: `${porcentaje}%`,
                }}
              />

            </div>

            <label>
              Código de verificación
            </label>

            {/* OTP */}

            <div className="otp-container">

              {otp.map((digit, index) => (

                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] =
                      element;
                  }}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={timeLeft === 0}
                  onChange={(e) =>
                    handleOtpChange(
                      e.target.value,
                      index
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(e, index)
                  }
                />

              ))}

            </div>

            {/* VERIFICAR */}

            <button
              className="login-button"
              onClick={verificarOTP}
              disabled={
                loading ||
                timeLeft === 0
              }
            >
              {loading
                ? "Verificando..."
                : "Verificar código"}
            </button>

            {message && (
              <div className="login-message">
                {message}
              </div>
            )}

            {/* REENVIAR */}

            {timeLeft === 0 && (

              <button
                className="resend-button active"
                onClick={reenviarOTP}
                disabled={loading}
              >
                ↻ Reenviar código OTP
              </button>

            )}

            {timeLeft > 0 && (

              <div className="resend-info">
                Podrás solicitar un nuevo
                código cuando expire.
              </div>

            )}

            <button
              className="back-button"
              onClick={volver}
            >
              ← Cambiar correo
            </button>

          </div>
        )}

        {/* FOOTER */}

        <div className="login-footer">

          <span>🔒</span>

          Acceso seguro mediante
          código OTP

        </div>

      </section>

    </main>
  );
}

export default Login;