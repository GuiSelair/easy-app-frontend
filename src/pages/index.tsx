import { useRef,useCallback } from 'react';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import Cookies from 'js-cookie';
import * as Yup from 'yup';
import { useRouter } from 'next/router';

import styles from '../styles/Home.module.css';
import SimpleInput from '../components/Form/SimpleInput';
import { api } from '../services/api';
import { auth } from '../config/auth';
import { useState } from 'react';

interface ILogin{
  email: string;
  password: string;
}

export default function Home() {
  const formRef = useRef<FormHandles>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const { push } = useRouter();

  const handleLogin = useCallback(async (data: ILogin) => {
    try {
      setLoginLoading(true);

      const schema = Yup.object().shape({
        email: Yup.string()
          .trim()
          .email()
          .required('Campo obrigatório'),
        password: Yup.string().required('Campo obrigatório').trim(),
      });
  
      await schema.validate(data, {
        abortEarly: false,
      });

      const { email, password } = data;

      const { data: authData } = await api.post("/login", {
        email,
        password,
      });

      if (authData.error){
        return;
      }
      
      api.defaults.headers.authorization = `Bearer ${authData.token}`
      
      Cookies.set("EasyApp!Token", authData.token);
      Cookies.set("EasyApp!UserEmail", authData.user.email);

      push("/niveis");

    } catch(error){
      Cookies.remove("EasyApp!Token");
      Cookies.remove("EasyApp!UserEmail");
    } finally {
      setLoginLoading(false);
      formRef.current?.reset();
    }


  }, []);

  return (
    <div className={styles.container}>
      <div>
        <h2>Login</h2>
        <span>Insira seus dados para continuarmos</span>

        <Form ref={formRef} onSubmit={handleLogin} className={styles.formContainer}>
          <SimpleInput
            name="email"
            type="text"
            placeholder="Insira seu email"
          />
          <SimpleInput
            name="password"
            type="password"
            placeholder="Insira sua senha"
          />
          <button type="submit" disabled={loginLoading}>
            {!loginLoading ? "Entrar" : "Carregando..." }
          </button>
        </Form>
      </div>
    </div>
  );
}
