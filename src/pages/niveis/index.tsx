import { AiFillFileAdd, AiFillEdit, AiFillSave, AiFillDelete, AiOutlineSearch, AiFillFilePdf } from 'react-icons/ai';
import { BiUndo } from 'react-icons/bi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import { GetServerSideProps } from 'next';
import { useMemo, useRef, useCallback, useState, useEffect } from 'react';

import SimpleSelect from '../../components/Form/SimpleSelect';
import SimpleInput from '../../components/Form/SimpleInput';
import Table from '../../components/Table';
import DashboardLayout from "../../layouts/dashboardLayout";
import { api } from '../../services/api';
import ILevelsCourses from '../../dtos/ILevelCoursesRequest';
import ILevelCoursesResponse from '../../dtos/ILevelCoursesResponse';

import styles from '../../styles/pages/Niveis.module.css';

interface ICourses {
  id_curso: number;
  descricao: string;
}

interface ILevels {
  id_nivel: number;
  id_curso: number;
  descricao: string;
  status: string;
  proximo_nivel: string;
  nivel_equivalente: string;
  nivel_equivalente2: string;
  nivel_equivalente3: string;
  nivel_equivalente4: string;
}

interface INiveisPage {
  allCourses: ICourses[];
  allLevelsAvailable: ILevels[];
  authToken: string;
}

export const getServerSideProps:GetServerSideProps<INiveisPage> = async (context) => {
  const { cookies } = context.req;

  if (!cookies["EasyApp!Token"]) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const { data: allCourses } = await api.get("/courses", {
    headers: {
      'Authorization': `Basic ${cookies["EasyApp!Token"]}`
    },
  });
  const { data: allLevelsAvailable } = await api.get("/courses/listAllLevels", {
    headers: {
      'Authorization': `Basic ${cookies["EasyApp!Token"]}`
    },
  });
  

  return {
    props: {
      allCourses,
      allLevelsAvailable,
      authToken: cookies["EasyApp!Token"],
    }
  }
}

export default function Niveis({ allCourses, allLevelsAvailable, authToken }: INiveisPage) {
  const formCourseRef = useRef<FormHandles>(null);
  const formLevelRef = useRef<FormHandles>(null);
  const [selectedCourse, setSelectedCourse] = useState<number>();
  const [selectedLevelCourseID, setSelectedLevelCourseID] = useState<number>();
  const [selectedLevelCourse, setSelectedLevelCourse] = useState<ILevelsCourses>({} as ILevelsCourses);
  const [isInputDisable, setIsInputDisable] = useState(true);
  const [disabledButtonsEdit, setDisabledButtonsEdit] = useState(false);
  const [disabledButtonsAdd, setDisabledButtonsAdd] = useState(false);
  const [disabledSelectLevelFilter, setDisabledSelectLevelFilter] = useState(true);
  const [selectedCourseIDFilter, setSelectedCourseIDFilter] = useState<number>();
  const [allLevelsByIDCourse, setAllLevelsByIDCourse] = useState([]);
  const [loadingAllLevelsFilter, setLoadingAllLevelsFilter] = useState(false);
  const [filter, setFilter] = useState<ILevelsCourses[]>([]);
  const [pdfData, setPdfData] = useState({});
  const [showPdfData, setShowPdfData] = useState(false);

  useEffect(() => {
    async function requestLevelCourse() {
      if (!selectedLevelCourseID) return;
      const { data } = await api.get(`/courses/listLevel/${selectedLevelCourseID}`, {
        headers: {
          'Authorization': `Basic ${authToken}`
        },
      });
      setSelectedLevelCourse(data);

      console.log("Buscando um nivel especifico");
      console.log(data);
      console.log("\n");
    }

    requestLevelCourse();
  }, [authToken, selectedLevelCourseID]);

  useEffect(() => {
    async function requestLevelCourse() {
      setLoadingAllLevelsFilter(true);
      if (!selectedCourseIDFilter) return;
      const { data } = await api.post(`/courses/listAllLevelsByIDCourse`, {
        id_curso: selectedCourseIDFilter,
      }, {
        headers: {
          'Authorization': `Basic ${authToken}`
        },
      });
      console.log("Listar todos os niveis de um curso");
      console.log(data);
      console.log("\n");

      setLoadingAllLevelsFilter(false);
      setAllLevelsByIDCourse(data);
    }

    requestLevelCourse();
  }, [authToken, selectedCourseIDFilter]);

  const tableColumns = useMemo(() => {
    return [
      {
        Header: 'Ativo',
        accessor: 'ativo',
      },
      {
        Header: 'Curso ID',
        accessor: 'id_curso',
      },
      {
        Header: 'Nível ID',
        accessor: 'id_nivel',
      },
      {
        Header: 'Descrição',
        accessor: 'descricao',
      },
      {
        Header: 'Próximo nível',
        accessor: 'proximoNivel',
      },
      {
        Header: 'Equiv 1',
        accessor: 'nivelEquivalente01',
      },
      {
        Header: 'Equiv 2',
        accessor: 'nivelEquivalente02',
      },
      {
        Header: 'Equiv 3',
        accessor: 'nivelEquivalente03',
      },
      {
        Header: 'Equiv 4',
        accessor: 'nivelEquivalente04',
      },
    ];
  }, []);

  const tableData = useMemo(() => {
    const ticketsFormatted = allLevelsAvailable.map(level => ({
      ativo: (
        <div style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          background: `${level.status === "S" ? "green" : "red"}`,
          margin: "0 auto"
        }} />
      ),
      id_curso: level.id_curso,
      id_nivel: level.id_nivel,
      descricao: level.descricao,
      proximoNivel: level.proximo_nivel,
      nivelEquivalente01: level.nivel_equivalente,
      nivelEquivalente02: level.nivel_equivalente2,
      nivelEquivalente03: level.nivel_equivalente3,
      nivelEquivalente04: level.nivel_equivalente4,
    }))

    return ticketsFormatted;
  }, [allLevelsAvailable]);

  const allCoursesOptions = useMemo(() => {
    return allCourses.map(course => ({
      value: course.id_curso,
      label: course.descricao
    }));
  }, [allCourses])

  const allLevelsByIDCourseOptions = useMemo(() => {
    return allLevelsByIDCourse.map(course => ({
      value: course.id_nivel,
      label: `${course.id_nivel} - ${course.descricao}`
    }));
  }, [allLevelsByIDCourse])

  const courseIDandName = useMemo(() => {
    const [findCourse] = allCourses.filter(course => course.id_curso === selectedCourse);
    if (!findCourse) return "";
    return `${findCourse.id_curso} - ${findCourse.descricao}`;
  }, [allCourses, selectedCourse])

  const initialDataForm = useMemo(() => {
    
    const updateData = {
      id_nivel: selectedLevelCourse.id_nivel,
      descricao: selectedLevelCourse.descricao,
      ordem: selectedLevelCourse.ordem,
      livroNome: selectedLevelCourse.livro,
      livroEdicao: selectedLevelCourse.livro_edicao,
      livroEditora: selectedLevelCourse.livro_editora,
      livroIsbn: selectedLevelCourse.isbn,
      cargaHoraria: selectedLevelCourse.cargahoraria,
      idadeFinal: selectedLevelCourse.idade_final,
      idadeInicial: selectedLevelCourse.idade_inicial,
      fontColor: selectedLevelCourse.font_color,
      backgroundColor: selectedLevelCourse.label_color,
    }
    formLevelRef?.current?.setFieldValue('ativo', {value: selectedLevelCourse.status, label: selectedLevelCourse.status === "S" ? "Sim" : "Não"});
    formLevelRef?.current?.setFieldValue('notaReprova', {value: selectedLevelCourse.reprovapornota, label: selectedLevelCourse.reprovapornota === "S" ? "Sim" : "Não"});
    formLevelRef?.current?.setFieldValue('faltaReprova', {value: selectedLevelCourse.reprovaporfalta, label: selectedLevelCourse.reprovaporfalta === "S" ? "Sim" : "Não"});
    formLevelRef?.current?.setFieldValue('modalidade', {value: selectedLevelCourse.online_presencial, label: selectedLevelCourse.online_presencial === "P" ? "Presencial" : "Online"});
    formLevelRef?.current?.setFieldValue('geraCertificado', {value: selectedLevelCourse.geracertificado, label: selectedLevelCourse.geracertificado === "S" ? "Sim" : "Não"});
    formLevelRef?.current?.setFieldValue('iniciante', {value: selectedLevelCourse.iniciante, label: selectedLevelCourse.iniciante === "S" ? "Sim" : "Não"});
    formLevelRef?.current?.setFieldValue('cursos', {value: selectedLevelCourse.id_curso, label: selectedLevelCourse.id_curso});

    console.log("Valores dos inputs de detalhes");
    console.log(updateData);
    console.log("\n");

    return !!Object.keys(selectedLevelCourse).length ? updateData: {};
  }, [selectedLevelCourse])
  
  // Botões de ação
  
  const handleFormLevelSubmit = useCallback(async (data: ILevelCoursesResponse) => {
    
    console.log("Valores a salvar ou editar");
    console.log(data);
    console.log("\n");
    
    if (!data.cursos) return;

    if (data.id_nivel){
      // UPDATE
      await api.put(`courses/${data.id_nivel}/level/update`, {
        ...data,
        id_curso: data.cursos,
      }, {
        headers: {
          'Authorization': `Basic ${authToken}`
        },
      });
      return;
      
    }

    await api.post(`courses/${data.cursos}/level/create`, data, {
      headers: {
        'Authorization': `Basic ${authToken}`
      },
    })
  }, [authToken]);

  const toggleInputsDisable = () => {
    setIsInputDisable(old => !old);
    setDisabledButtonsAdd(old => !old);
    setDisabledButtonsEdit(old => !old);

    // formLevelRef?.current.reset();
  }

  const handleSaveButtonClick = useCallback(() => {
    formLevelRef?.current.submitForm();
    // formLevelRef?.current.reset();
    toggleInputsDisable();
  }, []);

  const handleEditButtonClick = useCallback(() => {
    setIsInputDisable(old => !old);
    setDisabledButtonsEdit(old => !old);
  }, []);

  const handleAddButtonClick = useCallback(() => {
    setIsInputDisable(false);
  }, []);

  const handleDeleteButtonClick = useCallback(async () => {
    await api.delete(`/courses/${selectedLevelCourseID}/level/delete`, {
      headers: {
        'Authorization': `Basic ${authToken}`
      },
    });
    formLevelRef?.current.reset();

  }, [authToken, selectedLevelCourseID]);

  const handleUndoButtonClick = useCallback(() => {
    setDisabledButtonsAdd(false);
    setDisabledButtonsEdit(true);
    setIsInputDisable(true);

  }, []);

  // Filtro
  const handleChangeSelectFilterByCourses = useCallback(() => {
    const selectCourseValue = formCourseRef?.current.getFieldValue('filtrarPorCursos');
    
    if (!selectCourseValue) {
      setSelectedCourseIDFilter(undefined); 
      setDisabledSelectLevelFilter(true);
      return;
    }

    setSelectedCourseIDFilter(selectCourseValue);
    setDisabledSelectLevelFilter(false);
  }, []);

  const handleFormFilterSubmit = useCallback(async (data) => {
    setSelectedCourse(data.filtrarPorCursos);

    console.log("Filtros:");
    console.log(data);
    console.log("\n");

    if (!data.filtrarPorCursos) return;

    if (data.filtrarPorCursos && data.filtrarPorNivel){
      const { data: uniqueLevel } = await api.get(`/courses/listLevel/${data.filtrarPorNivel}`, {
        headers: {
          'Authorization': `Basic ${authToken}`
        }
      })
      setFilter([uniqueLevel]);
      return;
    }

    setFilter(allLevelsByIDCourse);

  }, [allLevelsByIDCourse, authToken]);

  const filterTableData = useMemo(() => {
    const ticketsFormatted = filter.map(test => ({
      ativo: (
        <div style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          background: `${test.status === "S" ? "green" : "red"}`,
          margin: "0 auto"
        }} />
      ),
      id_curso: test.id_curso,
      id_nivel: test.id_nivel,
      descricao: test.descricao,
      proximoNivel: test.proximo_nivel,
      nivelEquivalente01: test.nivel_equivalente,
      nivelEquivalente02: test.nivel_equivalente2,
      nivelEquivalente03: test.nivel_equivalente3,
      nivelEquivalente04: test.nivel_equivalente4,
    }));

    return ticketsFormatted;
  }, [filter]);

  // PDF
  const handleExportPDFClick = useCallback(async () => {
    const dataExport = !!selectedCourse ? filterTableData : tableData;

    if (!dataExport) return;

    const dataJSON = dataExport.map(data => ({
      ativo: String(data.ativo),
      id_curso: data.id_curso,
      id_nivel: data.id_nivel,
      descricao: data.descricao,
    }))

    const {data: pdf} = await api.post("/generatePDF", {
      data: dataJSON,
    }, {
      headers: {
        'Authorization': `Basic ${authToken}`,
      }
    })
    
    setPdfData(JSON.stringify(pdf));
    setShowPdfData(true);

  }, [authToken, filterTableData, selectedCourse, tableData]);


  return (
    <div className={styles.container}>
      <h3>Níveis de curso</h3>
      <header className={styles.header}>
        <strong>Ações</strong>
        <section className={styles.buttonContainer}>
          <ul>
            <li>
              <button disabled={disabledButtonsAdd} onClick={handleAddButtonClick}>
                <AiFillFileAdd size={20} />
                Incluir
              </button>
            </li>
            <li>
              <button disabled={!selectedLevelCourseID} onClick={handleEditButtonClick}>
                <AiFillEdit size={20} />
                Editar
              </button>
            </li>
            <li>
              <button onClick={handleSaveButtonClick} disabled={isInputDisable}>
                <AiFillSave size={20} />
                Salvar
              </button>
            </li>
          </ul>
          <ul>
            <li>
              <button disabled={isInputDisable} onClick={handleUndoButtonClick}>
                <BiUndo size={20} />
                Cancelar
              </button>
            </li>
            <li>
              <button disabled={!selectedLevelCourseID} onClick={handleDeleteButtonClick}>
                <AiFillDelete size={20} />
                Excluir
              </button>
            </li>
          </ul>
        </section>
        
      </header>
      <section className={styles.levelDetails}>
        <strong>Detalhes do nível</strong>
        <Form 
          ref={formLevelRef} 
          onSubmit={handleFormLevelSubmit} 
          initialData={initialDataForm}
        >
          <label htmlFor="id_curso" className={isInputDisable ? styles.disabled: undefined}>
            Curso
            <SimpleSelect name="cursos" id="cursos" options={allCoursesOptions} />
          </label>
          <label htmlFor="id_nivel" className={styles.disabled}>
            Nivel
            <SimpleInput width={100} type="number" name="id_nivel" id="id_nivel" disabled/>
          </label>
          <label htmlFor="descricao" className={isInputDisable ? styles.disabled: undefined}>
            Descrição
            <SimpleInput width={300} type="text" name="descricao" id="descricao" disabled={isInputDisable}/>
          </label>
          <label htmlFor="ordem" className={isInputDisable ? styles.disabled: undefined}>
            Ordem
            <SimpleInput width={100} type="number" name="ordem" id="ordem" disabled={isInputDisable}/>
          </label>
          <label htmlFor="livroNome" className={isInputDisable ? styles.disabled: undefined}>
            Livro
            <SimpleInput width={300} type="text" name="livroNome" id="livroNome" disabled={isInputDisable}/>
          </label>
          <label htmlFor="livroEditora" className={isInputDisable ? styles.disabled: undefined}>
            Editora
            <SimpleInput width={200} type="text" name="livroEditora" id="livroEditora" disabled={isInputDisable}/>
          </label>
          <label htmlFor="livroEdicao" className={isInputDisable ? styles.disabled: undefined}>
            Edição
            <SimpleInput width={100} type="text" name="livroEdicao" id="livroEdicao" disabled={isInputDisable}/>
          </label>
          <label htmlFor="livroIsbn"  className={isInputDisable ? styles.disabled: undefined}>
            ISBN
            <SimpleInput width={100} type="text" name="livroIsbn" id="livroIsbn" disabled={isInputDisable}/>
          </label>
          <label htmlFor="ativo" className={isInputDisable ? styles.disabled: undefined} >
            Ativo
            <SimpleSelect name="ativo" id="ativo" options={[
              {value: "S", label: "Sim"}, 
              {value: "N", label: "Não"}]}
              isDisabled={isInputDisable}
            />
          </label>
          <label htmlFor="geraCertificado" className={isInputDisable ? styles.disabled: undefined}>
            Gera Certificado
            <SimpleSelect name="geraCertificado" id="geraCertificado" options={[
              {value: "S", label: "Sim"}, 
              {value: "N", label: "Não"}]}
              isDisabled={isInputDisable}
            />
          </label>
          <label htmlFor="cargaHoraria" className={isInputDisable ? styles.disabled: undefined}>
            Carga horaria
            <SimpleInput type="text" name="cargaHoraria" id="cargaHoraria" disabled={isInputDisable}/>
          </label>
          <label htmlFor="iniciante" className={isInputDisable ? styles.disabled: undefined}>
            Iniciante
            <SimpleSelect name="iniciante" id="iniciante" options={[
              {value: "S", label: "Sim"}, 
              {value: "N", label: "Não"}]}
              isDisabled={isInputDisable}
            />
          </label>
          <label htmlFor="idadeInicial" className={isInputDisable ? styles.disabled: undefined}>
            Idade inicial
            <SimpleInput width={100} type="number" name="idadeInicial" id="idadeInicial" disabled={isInputDisable}/>
          </label>
          <label htmlFor="idadeFinal" className={isInputDisable ? styles.disabled: undefined}>
            Idade final
            <SimpleInput width={100} type="number" name="idadeFinal" id="idadeFinal" disabled={isInputDisable}/>
          </label>
          <label htmlFor="faltaReprova" className={isInputDisable ? styles.disabled: undefined}>
            Falta Reprova
            <SimpleSelect name="faltaReprova" id="faltaReprova" options={[
              {value: "S", label: "Sim"}, 
              {value: "N", label: "Não"}]}
              isDisabled={isInputDisable}
            />
          </label>
          <label htmlFor="notaReprova" className={isInputDisable ? styles.disabled: undefined}>
            Nota Reprova
            <SimpleSelect name="notaReprova" id="notaReprova" options={[
              {value: "S", label: "Sim"}, 
              {value: "N", label: "Não"}]}
              isDisabled={isInputDisable}
            />
          </label>
          <label htmlFor="modalidade" className={isInputDisable ? styles.disabled: undefined}>
            Modalidade
            <SimpleSelect name="modalidade" id="modalidade" options={[
              {value: "P", label: "Presencial"}, 
              {value: "O", label: "Online"}]}
              isDisabled={isInputDisable}
            />
          </label>
          
          <label htmlFor="fontColor" className={isInputDisable ? styles.disabled: undefined}>
            FontColor
            <SimpleInput width={160} type="text" name="fontColor" id="fontColor" disabled={isInputDisable}/>
          </label>

          <label htmlFor="backgroundColor" className={isInputDisable ? styles.disabled: undefined}>
            Background
            <SimpleInput width={160} type="text" name="backgroundColor" id="backgroundColor" disabled={isInputDisable}/>
          </label>
        </Form>
      </section>
      <section className={styles.filters}>
        <label htmlFor="filtrarPorCursos">Filtros:</label>
        <Form ref={formCourseRef} onSubmit={handleFormFilterSubmit}>
          <SimpleSelect 
            name="filtrarPorCursos" 
            id="filtrarPorCursos" 
            options={allCoursesOptions} 
            placeholder="Filtrar por curso" 
            onInputChange={handleChangeSelectFilterByCourses}
            isClearable
            isSearchable
          />

          <SimpleSelect 
            name="filtrarPorNivel" 
            id="filtrarPorNivel" 
            options={allLevelsByIDCourseOptions} 
            placeholder="Filtrar por Nivel" 
            isDisabled={disabledSelectLevelFilter}
            isLoading={loadingAllLevelsFilter}
            isClearable
            isSearchable
          />
            
          <button type="submit">
            <AiOutlineSearch size={19} color="white"/>
          </button>

          
        </Form>

        
      </section>
      <section className={styles.tableLevels}>
        
        <strong>Tabela de níveis</strong>
        <button onClick={handleExportPDFClick}>
          <AiFillFilePdf size={20}/>
          Exportar para PDF
        </button>
        {showPdfData && (
          <pre>{pdfData}</pre>
        )}
        <Table 
          columns={tableColumns}
          data={!!selectedCourse ? filterTableData : tableData}
          set_selected_level_course={setSelectedLevelCourseID}
        />
      </section>
      <footer className={styles.footer}>
        <span>{`Curso ${courseIDandName}`}</span>
        <span>{`Usuário: guilherme@gmail.com`}</span>
      </footer>
    </div>
  );
}

Niveis.layout = DashboardLayout;