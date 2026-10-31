import { useState } from 'react';

export function useContractDocumentClauses() {
  const [clause3Text, setClause3Text] = useState(
    'Horas adicionais serão cobradas em 20% do valor total por hora, conforme disponibilidade de insumos e equipe.',
  );
  const [clause4Fines, setClause4Fines] = useState(
    'Até 10 dias antes: multa de 20% do valor total.\nAté 7 dias ' +
      'antes: multa de 50%.\nMenos de 24h antes: cobrança integral.',
  );
  const [clause4Force, setClause4Force] = useState(
    'A Contratada ficará isenta de responsabilidade por eventual não realização do evento em virtude de ' +
      'queda/falta de energia, caso fortuito ou de força maior (chuva, tempestades etc.), entretanto será ' +
      'reagendado uma nova data nas mesmas condições, ou o valor da entrada será devolvido em até 3 dias ' +
      'úteis para a conta bancária.',
  );
  const [clause5Intro, setClause5Intro] = useState(
    'A CONTRATADA fornecerá guardanapos, tábuas, bandejas e utensílios necessários.',
  );
  const [clause5Outro, setClause5Outro] = useState(
    'Até 5 colaboradores de outros serviços poderão se alimentar antes do início sem custo adicional, limi' +
      'tando-se aos sabores disponíveis. Demais serviços não listados são responsabilidade dos CONTRATANTES.',
  );
  const [clause6Phone, setClause6Phone] = useState('(19) 98160-5481');
  const [clause7Text, setClause7Text] = useState(
    'Este contrato é válido exclusivamente para o evento descrito e a' +
      ' proposta tem validade de 5 dias a partir da data de assinatura.',
  );
  const [clause8Text, setClause8Text] = useState(
    'Qualquer modificação só terá validade se feita por escrito e assinada por ambas as partes.',
  );
  const [witness1Name, setWitness1Name] = useState('');
  const [witness1Cpf, setWitness1Cpf] = useState('');
  const [witness2Name, setWitness2Name] = useState('');
  const [witness2Cpf, setWitness2Cpf] = useState('');
  const [contractCity, setContractCity] = useState('Sorocaba/SP');
  return {
    clause3Text,
    setClause3Text,
    clause4Fines,
    setClause4Fines,
    clause4Force,
    setClause4Force,
    clause5Intro,
    setClause5Intro,
    clause5Outro,
    setClause5Outro,
    clause6Phone,
    setClause6Phone,
    clause7Text,
    setClause7Text,
    clause8Text,
    setClause8Text,
    witness1Name,
    setWitness1Name,
    witness1Cpf,
    setWitness1Cpf,
    witness2Name,
    setWitness2Name,
    witness2Cpf,
    setWitness2Cpf,
    contractCity,
    setContractCity,
  };
}
