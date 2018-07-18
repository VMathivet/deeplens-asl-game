# deeplens-asl-game
Deeplens game to learn ASL (American Sign Language)

Nowadays, technology reduces the distances, and allow us to communicate with each other even if not in the same place. Real-time translations permits to speach with people of differente languages and cultures. But there are some cases where communication is difficult. For example, deaf people (and mute ones) could not easily communicate with other people, because nearly no one can speak ASL.

The processing of video flow and a deep learning model can leverage the Deeplens as a new interface for helping everyone to take into account those difficulties, and focusing on education.

It's a little game to learn ASL (for hearing people). The goal is to make the words the more quickly possible, with the higher accuracy. Each letter is indicating in roman and ASL alphabet. A timer is indicating the time left. You have 3 tries by word.

We have chosen the alphabet because it is mainly composed of static hands positions. Our model is homemade, based on a Sagemaker vision model, fine trained on a specific dataset we have made. We have removed ‘j’ and ‘z’ letters, as they require movement.

## Demo video

Video available on Youtube

## How to use it

### Prerequisites

Make sure you performed the following actions before continuing with the next steps:
``` bash
# create a GIT directory within your user home folder
$ cd
$ mkdir GIT
$ cd GIT
# clone that deepLens-asl-game project
$ git clone https://github.com/VMathivet/deeplens-asl-game.git awsdeeplensgame
```

### Deployment
The model is located in the *model* folder and the Lambda function handler is located in the *lambda* folder. To use it, you just have to follow the same steps as described in the [AWS documentation](https://docs.aws.amazon.com/deeplens/latest/dg/deeplens-train-model.html) starting step 4.

Once deployed on the DeepLens, you will have deploy the game interface. **Make sure to have NodeJS 8.10 installed on your AWS DeepLens**
To deploy it, perform the following command lines:
``` bash
# go to the src folder
$ cd src

# install (dev) dependencies - NodeJS 8.10 must be installed on the AWS DeepLens device
$ npm i --only=dev

# TO PERFORM A QUICK TEST => serve with hot reload at localhost:3000
$ npm run start
```

If you performed the *npm run start* command line and checks the web server is up and running with the Inteface, you can stop it and create a [Startup Application](https://help.ubuntu.com/stable/ubuntu-help/startup-applications.html.en) by specifying the **src/start_deeplens_game.sh** file

###  Interface

![Interface](images/interface.png)

Be careful: there is a small delay between your movement and the camera feedback.

Here is the ASL alphabet that you can use: 
![ASL alphabet](images/asl-alphabet.png)

Samples can be found in the [samples folder](samples/) (images were extracted from our dataset).

## How we made it

The dataset was homemade. We have taken different pictures with different people for each letter of the alphabet (except 'j' and 'z'). We have used data augmentation (mirror and crops) to have ~1000 images by letter.

The training was done using Amazon SageMaker, with transfer learning on a resnet with 18 layers. It converges in 5 epochs to a satisfaying result.

The Game UX was built upon of [NuxtJS](https://nuxtjs.org/guide) framework and is using [Vue Material](https://vuematerial.io/) for the renderer. The different mechanisms like levels, lifes, score has been developed in Vanilla JS (upon of NuxtJS and additional node modules) + HTML5 + CSS2/3

This is the project architecture:
![Architecture](images/architecture.png)

## Who we are

[TODO]
