// Tudo que muda de cliente para cliente fica aqui.
export const site = {
  nome: 'Nome da Empresa',
  slogan: 'Uma frase curta que vende.',
  descricao: 'Descrição de 150 a 160 caracteres para o Google, com o serviço principal e a cidade.',
  cidade: 'Cidade',
  estado: 'UF',
  endereco: 'Rua Exemplo, 123 — Bairro',
  telefone: '+55 00 00000-0000',
  whatsapp: '5500000000000', // só números, com DDI e DDD
  mensagemWhatsapp: 'Olá! Vim pelo site e gostaria de um orçamento.',
  instagram: 'https://instagram.com/',
  email: 'contato@exemplo.com.br',
};

export const linkWhatsapp = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.mensagemWhatsapp)}`;
