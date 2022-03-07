import {Request, Response} from 'express';

import { getRepository } from 'typeorm';
import Orphanages from '../models/Orphanages';
import orphanageView from '../views/orphanages_view';

import * as Yup from 'yup';

export default {
    async index({}: Request, res: Response){
        const orphanagesRepository = getRepository(Orphanages);
        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });
        return res.json(orphanageView.renderMany(orphanages));
    },

    async show(req: Request, res: Response){
        const {id} = req.params;
        const orphanagesRepository = getRepository(Orphanages);
        const orphanage = await orphanagesRepository.findOneOrFail(id,{
                relations: ['images']
            });
        return res.json(orphanageView.render(orphanage))
    },

    async create(req: Request, res: Response){
        const {
            name, 
            latitude, 
            longitude,
            about,
            whatsapp,
            instructions,
            opening_hours,
            open_on_weekends
        } = req.body
    
        const orphanagesRepository = getRepository(Orphanages);

        const requestImages = req.files as Express.Multer.File[];

        const images = requestImages.map(image => {
            return {path: image.filename}
        }) 

        const data = {
            name,
            latitude,
            longitude,
            about,
            whatsapp,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            images 
        }

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            whatsapp: Yup.string().required(),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.array(Yup.object().shape({
                path: Yup.string().required()
            })).required()
        })

        await schema.validate(data, {
            abortEarly: false,
        })

        const orphanage = orphanagesRepository.create(data);
        await orphanagesRepository.save(orphanage);
        return res.status(201).json(orphanage)
    }
};