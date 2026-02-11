import { BRAND } from '@/lib/constants/brand';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso Legal',
};

export default function AvisoLegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-dark mb-8">Aviso Legal</h1>

      <div className="prose prose-lg max-w-none prose-headings:text-brand-dark">
        <h2>Datos identificativos</h2>
        <p>
          En cumplimiento con el deber de informacion recogido en articulo 10 de la Ley 34/2002,
          de 11 de julio, de Servicios de la Sociedad de la Informacion y del Comercio Electronico,
          a continuacion se reflejan los siguientes datos:
        </p>
        <ul>
          <li><strong>Titular:</strong> {BRAND.company.legalName}</li>
          <li><strong>Domicilio:</strong> {BRAND.company.address}, {BRAND.company.postalCode} {BRAND.company.city} ({BRAND.company.region})</li>
          <li><strong>Email:</strong> {BRAND.contacts.disclaimer}</li>
        </ul>

        <h2>Objeto</h2>
        <p>
          El presente aviso legal regula el uso y utilizacion del sitio web {BRAND.name},
          del que es titular {BRAND.company.legalName}.
        </p>
        <p>
          La navegacion por el sitio web atribuye la condicion de usuario del mismo e implica
          la aceptacion plena y sin reservas de todas y cada una de las disposiciones incluidas
          en este Aviso Legal.
        </p>

        <h2>Propiedad intelectual e industrial</h2>
        <p>
          El sitio web, incluyendo a titulo enunciativo pero no limitativo su programacion,
          edicion, compilacion y demas elementos necesarios para su funcionamiento, los disenos,
          logotipos, texto y/o graficos son propiedad de {BRAND.company.legalName} o en su caso
          dispone de licencia o autorizacion expresa por parte de los autores.
        </p>
        <p>
          Todos los contenidos del sitio web se encuentran debidamente protegidos por la normativa
          de propiedad intelectual e industrial.
        </p>

        <h2>Proteccion de datos</h2>
        <p>
          {BRAND.company.legalName} se encuentra profundamente comprometido con el cumplimiento
          de la normativa de proteccion de datos personales y garantiza el cumplimiento integro
          de las obligaciones dispuestas, asi como la implementacion de las medidas de seguridad
          dispuestas en el Reglamento General de Proteccion de Datos (RGPD) (UE) 2016/679.
        </p>
        <p>
          Para mas informacion sobre el tratamiento de sus datos personales, puede contactar
          con nosotros en: <a href={`mailto:${BRAND.contacts.disclaimer}`}>{BRAND.contacts.disclaimer}</a>
        </p>

        <h2>Legislacion aplicable y jurisdiccion</h2>
        <p>
          Para la resolucion de todas las controversias o cuestiones relacionadas con el
          presente sitio web, sera de aplicacion la legislacion espanola, a la que se someten
          expresamente las partes, siendo competentes para la resolucion de todos los conflictos
          derivados o relacionados con su uso los Juzgados y Tribunales de {BRAND.company.city}.
        </p>
      </div>
    </div>
  );
}
