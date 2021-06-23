
import { Form } from "@unform/web";
import { useState } from "react";
import SimpleInput from "../../components/Form/SimpleInput";
import DashboardLayout from "../../layouts/dashboardLayout";
import { api } from "../../services/api";

import styles from '../../styles/pages/ConsultaAPI.module.css';


export const getServerSideProps = async (context) => {
  const { cookies } = context.req;

  if (!cookies["EasyApp!Token"]) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {}
  }
}

export default function ConsultaAPI() {
  const [responseAPI, setResponseAPI] = useState({});

  async function handleSubmit(data) {
    try {
      const response = await api.post("/localweb", {
        subject: data.assunto,
        body: "Olá, tudo bem?",
        from: data.remetente,
        to: data.destinatario,
      })

      setResponseAPI(response);
    }catch(err){
      console.log(err);
      setResponseAPI(err);
    }
  }

  return (
    <div className={styles.container}>
      <h3>Consulta a API LocalWEB - SMTP</h3>

      <div>
        <section className={styles.request}>
          <h4>Request</h4>
          <hr />
          <Form onSubmit={handleSubmit}>
            <SimpleInput
              name="remetente"
              type="email"
              placeholder="Remetente"
            />
            <SimpleInput
              name="destinatario"
              type="email"
              placeholder="Destinatario"
            />
            <SimpleInput
              name="assunto"
              type="text"
              placeholder="Assunto"
            />
            <button type="submit">ENVIAR</button>
          </Form>
        </section>
        <section className={styles.response}>
          <h4>Response</h4>
          <hr />
          <pre >
            {JSON.stringify(responseAPI, undefined, 2)}
          </pre>
        </section>
      </div>

    </div>
  );
}

ConsultaAPI.layout = DashboardLayout;