import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as docker from '@pulumi/docker-build';

// Cria um repositorio no ECR (Elastic Container Registry) para armazenar a imagem do docker
const ordersRCRRepository = new awsx.ecr.Repository('orders-ecr', {
   forceDelete: true,
});

const ordersECRToken = aws.ecr.getAuthorizationTokenOutput({
   registryId: ordersRCRRepository.repository.registryId,
});

// Cria a imagem do docker a partir do Dockerfile localizado na pasta app-orders
const ordersDockerImage = new docker.Image('orders-image', {
   tags: [
      pulumi.interpolate`${ordersRCRRepository.repository.repositoryUrl}:latest`,
   ],
   context: {
      location: '../app-orders',
   },
   push: true,
   platforms: ['linux/amd64'],
   registries: [
      {
         // Faz o link entre a imagem gerada e o ECR criado previamente
         address: ordersRCRRepository.repository.repositoryUrl,
         // Utiliza o token de autorização do ECR para autenticar o push da imagem
         username: ordersECRToken.userName,
         password: ordersECRToken.password,
      },
   ],
});

// Cria um cluster ECS (Elastic Container Service) para executar o serviço Fargate
const cluster = new awsx.classic.ecs.Cluster('app-cluster');

// O Fargate é um serviço de computação sem servidor que permite executar contêineres Docker
// sem precisar gerenciar servidores ou clusters. Ele é integrado ao ECS e permite que você execute
// contêineres de forma escalável e sob demanda, pagando apenas pelo tempo de execução dos contêineres.
const ordersService = new awsx.classic.ecs.FargateService('fargate-orders', {
   cluster,
   desiredCount: 1,
   waitForSteadyState: false,
   taskDefinitionArgs: {
      container: {
         image: ordersDockerImage.ref,
         cpu: 256, // 1/4 vCPU
         memory: 512, // 512 MB
      },
   },
});
